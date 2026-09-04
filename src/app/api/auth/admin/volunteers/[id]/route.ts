import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { VolunteerProfile } from "@/models/VolunteerProfile";
import { requireAdminSession } from "@/lib/auth";

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const volunteer = await VolunteerProfile.findByIdAndUpdate(
    params.id,
    {
      $set: {
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
      },
    },
    { new: true }
  );

  if (!volunteer) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }

  return NextResponse.json({ status: 200, data: volunteer }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await VolunteerProfile.findByIdAndDelete(params.id);
  return NextResponse.json({ status: 200, message: "Volunteer deleted." }, { status: 200 });
}
