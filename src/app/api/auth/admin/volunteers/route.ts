import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { VolunteerProfile } from "@/models/VolunteerProfile";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const volunteers = await VolunteerProfile.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ status: 200, data: volunteers }, { status: 200 });
}

export async function POST(request: NextRequest) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const volunteer = await VolunteerProfile.create({
    name: body.name,
    email: String(body.email || "").trim().toLowerCase(),
    phone: body.phone || "",
    city: body.city || "",
    gender: body.gender || "Unknown",
    roles: Array.isArray(body.roles) ? body.roles : [],
    assignments: Array.isArray(body.assignments) ? body.assignments : [],
    availability: body.availability || "",
    staffingFocus: body.staffingFocus || "",
    notes: body.notes || "",
    isActive: body.isActive !== false,
  });

  return NextResponse.json({ status: 201, data: volunteer }, { status: 201 });
}
