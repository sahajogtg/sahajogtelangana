import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest } from "@/lib/auth";
import { EventSubscription } from "@/models/EventSubscription";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { status: 400, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check session (cookie or mobile Bearer token)
    const session = await getSessionFromRequest(request);

    const subscription = await EventSubscription.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: session?.name || body.name || "",
          userId: session?.id || body.userId || undefined,
          isActive: true,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, message: "You are subscribed for future event updates.", data: subscription },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving event subscription:", error);
    return NextResponse.json(
      { status: 500, message: "Unable to save your subscription right now." },
      { status: 500 }
    );
  }
}
