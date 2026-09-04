import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRequest } from "@/models/EventRequest";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const session = await getSessionFromRequest(request);
    if (!session?.email) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await request.json();
    const { eventName, description, eventType, proposedStartDate, time, location, additionalNotes } = body;

    if (!eventName || !proposedStartDate || !time || !location) {
      return NextResponse.json({ error: "Event name, date, time, and location are required." }, { status: 400 });
    }

    const eventRequest = await EventRequest.create({
      name: session.name || "",
      email: session.email,
      eventName,
      description: description || "",
      eventType: eventType || "",
      proposedStartDate: new Date(proposedStartDate),
      time,
      location,
      additionalNotes: additionalNotes || "",
      status: "Pending",
    });

    return NextResponse.json(
      { message: "Event request submitted successfully. It will be reviewed by an admin.", data: { id: eventRequest._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit event request:", error);
    return NextResponse.json({ error: "Failed to submit event request." }, { status: 500 });
  }
}
