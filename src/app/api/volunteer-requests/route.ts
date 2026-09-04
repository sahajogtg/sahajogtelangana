import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest } from "@/lib/auth";
import { VolunteerRequest } from "@/models/VolunteerRequest";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const body = await request.json();
  const interests = Array.isArray(body.interests)
    ? body.interests.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];

  if (!body.phone || !body.city || interests.length === 0 || !body.availability) {
    return NextResponse.json({ status: 400, message: "Please fill all required volunteer details." }, { status: 400 });
  }

  const volunteerRequest = await VolunteerRequest.findOneAndUpdate(
    { email: session.email.toLowerCase(), status: "Pending" },
    {
      $set: {
        userId: session.id,
        name: session.name || "Sahaja Yogi",
        email: session.email.toLowerCase(),
        phone: String(body.phone).trim(),
        city: String(body.city).trim(),
        interests,
        availability: String(body.availability).trim(),
        experience: String(body.experience || "").trim(),
        status: "Pending",
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(
    { status: 200, message: "Your volunteer request has been shared with the admin team.", data: volunteerRequest },
    { status: 200 }
  );
}
