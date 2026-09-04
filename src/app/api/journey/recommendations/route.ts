import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import vine, { errors } from "@vinejs/vine";
import mongoose from "mongoose";
import { connect } from "@/database/mongo.config";
import { buildJourneyRecommendations } from "@/lib/journey";
import { JourneySession } from "@/models/JourneySession";
import ErrorReporter from "@/validator/ErrorReporter";
import { journeyRecommendationSchema } from "@/validator/authValidationSchema";
import { getRequiredSession, normalizeEmail } from "@/lib/auth";
import { enforceJourneyRateLimit } from "@/lib/journeySecurity";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const rateLimit = await enforceJourneyRateLimit({
      request,
      routeKey: "journey:recommendations",
      windowMs: 1000 * 60 * 10,
      maxRequests: 30,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ status: rateLimit.status, message: rateLimit.message }, { status: rateLimit.status });
    }

    const body = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(journeyRecommendationSchema);
    const payload = await validator.validate(body);
    const hasCoordinates = typeof payload.latitude === "number" && typeof payload.longitude === "number";
    const recommendations = await buildJourneyRecommendations(payload);
    const session = await getRequiredSession();
    const normalizedEmail = normalizeEmail(session?.user?.email);
    const sessionKey = payload.sessionKey || randomUUID();
    const resolvedCity =
      payload.city
      || recommendations.center?.city
      || (hasCoordinates ? "Nearby location" : "");

    const savedSession = await JourneySession.findOneAndUpdate(
      { sessionKey },
      {
        $set: {
          userId: session?.user?.id && mongoose.Types.ObjectId.isValid(String(session.user.id))
            ? new mongoose.Types.ObjectId(session.user.id)
            : undefined,
          userEmail: normalizedEmail,
          isNewToMeditation: payload.isNewToMeditation,
          preferredMode: payload.preferredMode,
          city: resolvedCity,
          sourcePage: payload.sourcePage || "",
          latitude: payload.latitude,
          longitude: payload.longitude,
          startPagePath: recommendations.startPage.path,
          recommendedCenterId: recommendations.center?._id && mongoose.Types.ObjectId.isValid(recommendations.center._id)
            ? new mongoose.Types.ObjectId(recommendations.center._id)
            : undefined,
          recommendedCenterSource: recommendations.center?.source || "",
          recommendedCenterExternalId: recommendations.center?.source === "sycenters"
            ? Number((recommendations.center as any).externalCenterId || 0) || undefined
            : undefined,
          recommendedCenterName: recommendations.center?.zone || "",
          recommendedCenterCity: recommendations.center?.city || "",
          recommendedEventIds: recommendations.events
            .filter((event) => mongoose.Types.ObjectId.isValid(event._id))
            .map((event) => new mongoose.Types.ObjectId(event._id)),
          recommendedEventTitles: recommendations.events.map((event) => event.title),
          status: "recommended",
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      status: 200,
      data: {
        sessionKey,
        sessionId: savedSession ? String((savedSession as any)._id) : "",
        resolvedCity,
        recommendations,
      },
    }, { status: 200 });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json({ status: 400, errors: error.messages }, { status: 400 });
    }

    console.error("Failed to generate journey recommendations:", error);
    return NextResponse.json({ status: 500, message: "Unable to generate recommendations right now." }, { status: 500 });
  }
}
