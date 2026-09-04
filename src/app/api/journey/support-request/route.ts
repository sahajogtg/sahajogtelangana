import { NextRequest, NextResponse } from "next/server";
import vine, { errors } from "@vinejs/vine";
import mongoose from "mongoose";
import { connect } from "@/database/mongo.config";
import { JourneySession } from "@/models/JourneySession";
import { Seeker } from "@/models/Seeker";
import ErrorReporter from "@/validator/ErrorReporter";
import { journeySupportSchema } from "@/validator/authValidationSchema";
import { enforceJourneyRateLimit } from "@/lib/journeySecurity";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const requestPreview = await request.clone().json().catch(() => ({}));
    const previewEmail = String(requestPreview?.email || "").trim().toLowerCase();
    const previewPhone = String(requestPreview?.phoneNumber || "").replace(/\s+/g, "").trim();
    const rateLimit = await enforceJourneyRateLimit({
      request,
      routeKey: "journey:support-request",
      windowMs: 1000 * 60 * 60,
      maxRequests: 5,
      extraFingerprintParts: [
        previewEmail,
        previewPhone,
      ].filter(Boolean),
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ status: rateLimit.status, message: rateLimit.message }, { status: rateLimit.status });
    }

    const body = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(journeySupportSchema);
    const payload = await validator.validate(body);
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPhone = payload.phoneNumber.replace(/\s+/g, "").trim();

    const journeySession = payload.sessionKey
      ? await JourneySession.findOne({ sessionKey: payload.sessionKey }).lean()
      : null;
    const resolvedCity = payload.city || String((journeySession as any)?.recommendedCenterCity || "").trim() || "Online";

    const duplicateSeeker = await Seeker.findOne({
      email: normalizedEmail,
      phone: normalizedPhone,
      addedBy: "Journey Hub",
      addedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    }).lean();

    if (duplicateSeeker) {
      return NextResponse.json({
        status: 200,
        message: "We already received your request and will follow up soon.",
        data: { seekerId: String((duplicateSeeker as any)._id) },
      }, { status: 200 });
    }

    const seeker = await Seeker.create({
      name: payload.name,
      city: resolvedCity,
      phone: normalizedPhone,
      email: normalizedEmail,
      addedBy: "Journey Hub",
      source: "Journey Hub",
      centerInterest: String((journeySession as any)?.recommendedCenterName || ""),
      eventInterest: Array.isArray((journeySession as any)?.recommendedEventTitles)
        ? (journeySession as any).recommendedEventTitles.join(", ")
        : "",
      preferredLanguage: "English",
      followUpStatus: "New",
      notes: [
        payload.notes || "",
        `Meditation experience: ${payload.isNewToMeditation ? "New to meditation" : "Already familiar with meditation"}`,
        `Preferred mode: ${payload.preferredMode === "in_person" ? "In-person center" : "Online guidance"}`,
        (journeySession as any)?.recommendedCenterCity
          ? `Recommended city: ${(journeySession as any).recommendedCenterCity}`
          : "",
        (journeySession as any)?.recommendedCenterSource
          ? `Center source: ${(journeySession as any).recommendedCenterSource}`
          : "",
        (journeySession as any)?.recommendedCenterExternalId
          ? `External center id: ${(journeySession as any).recommendedCenterExternalId}`
          : "",
      ].filter(Boolean).join(" | "),
      journeySessionId: journeySession?._id && mongoose.Types.ObjectId.isValid(String(journeySession._id))
        ? journeySession._id
        : undefined,
      journeySource: "Seeker Journey Hub",
      recommendationAccepted: true,
    });

    if (journeySession?._id) {
      await JourneySession.findByIdAndUpdate(journeySession._id, {
        $set: {
          supportRequestedAt: new Date(),
          status: "support_requested",
        },
      });
    }

    return NextResponse.json({
      status: 200,
      message: "Your support request has been received.",
      data: { seekerId: String(seeker._id) },
    }, { status: 200 });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json({ status: 400, errors: error.messages }, { status: 400 });
    }

    console.error("Failed to create journey support request:", error);
    return NextResponse.json({ status: 500, message: "Unable to send your request right now." }, { status: 500 });
  }
}
