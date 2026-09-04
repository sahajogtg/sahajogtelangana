import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { User } from "@/models/User";
import { VolunteerRequest } from "@/models/VolunteerRequest";
import { VolunteerProfile } from "@/models/VolunteerProfile";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const action = String(body.action || "").trim();
  const requestRecord = await VolunteerRequest.findById(params.id);

  if (!requestRecord) {
    return NextResponse.json({ error: "Volunteer request not found" }, { status: 404 });
  }

  if (action === "approve") {
    await VolunteerProfile.findOneAndUpdate(
      { email: requestRecord.email },
      {
        $set: {
          name: requestRecord.name,
          email: requestRecord.email,
          phone: requestRecord.phone,
          city: requestRecord.city,
          roles: requestRecord.interests,
          availability: requestRecord.availability,
          staffingFocus: requestRecord.interests.join(", "),
          notes: requestRecord.experience || "",
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    await User.findOneAndUpdate(
      { email: requestRecord.email.toLowerCase() },
      { $set: { role: "Volunteer" } }
    );
    requestRecord.status = "Approved";
    await requestRecord.save();
  } else if (action === "reject") {
    requestRecord.status = "Rejected";
    await requestRecord.save();
  } else {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  return NextResponse.json({ status: 200, data: requestRecord }, { status: 200 });
}
