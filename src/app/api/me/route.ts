import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { EventRegistration } from "@/models/EventRegistration";
import { Event } from "@/models/Event";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }
  const normalizedEmail = normalizeEmail(session.email);

  const user = (await User.findOne({ email: exactEmailMatch(normalizedEmail) }).lean()) as any;
  if (!user) {
    return NextResponse.json({ status: 404, message: "User not found." }, { status: 404 });
  }

  const registrations = (await EventRegistration.find({ email: exactEmailMatch(normalizedEmail) }).lean()) as any[];
  const eventIds = Array.from(new Set(registrations.map((registration) => registration.eventId).filter(Boolean)));
  const liveEvents = (await Event.find({ _id: { $in: eventIds } }, { _id: 1, title: 1 }).lean()) as any[];
  const eventInterest = liveEvents.map((event: any) => event.title).sort((a: string, b: string) => a.localeCompare(b));

  return NextResponse.json({
    status: 200,
    data: {
      name: user.name || "",
      email: user.email,
      city: user.city || "",
      centerInterest: user.centerInterest || "",
      eventInterest,
      role: user.role || "User",
    },
  }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }
  const normalizedEmail = normalizeEmail(session.email);

  const body = await request.json();
  const name = String(body.name || "").trim();
  const city = String(body.city || "").trim();

  if (!name) {
    return NextResponse.json({ status: 400, message: "Name is required." }, { status: 400 });
  }

  const user = (await User.findOneAndUpdate(
    { email: exactEmailMatch(normalizedEmail) },
    { $set: { name, city } },
    { new: true }
  ).lean()) as any;

  return NextResponse.json({
    status: 200,
    message: "Profile updated successfully.",
    data: user,
  }, { status: 200 });
}
