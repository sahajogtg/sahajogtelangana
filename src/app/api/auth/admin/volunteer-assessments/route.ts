import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { User } from "@/models/User";
import { VolunteerAssessment } from "@/models/VolunteerAssessment";
import { VolunteerProfile } from "@/models/VolunteerProfile";
export const dynamic = "force-dynamic";

export async function GET() {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const assessments = await VolunteerAssessment.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ status: 200, data: assessments }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const assessmentId = String(body.assessmentId || "").trim();
  const action = String(body.action || "").trim();

  const assessment = await VolunteerAssessment.findById(assessmentId);
  if (!assessment) {
    return NextResponse.json({ error: "Screening not found" }, { status: 404 });
  }

  if (action === "approve") {
    await VolunteerProfile.findOneAndUpdate(
      { email: assessment.email },
      {
        $set: {
          name: assessment.name,
          email: assessment.email,
          phone: assessment.phone,
          city: assessment.city,
          interests: assessment.interests,
          roles: assessment.interests,
          availability: assessment.availability,
          staffingFocus: assessment.interests.join(", "),
          notes: `Volunteer screening score: ${assessment.score}/${assessment.maxScore}`,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    await User.findOneAndUpdate(
      { email: assessment.email },
      { $set: { role: "Volunteer" } }
    );
    assessment.status = "Approved";
    assessment.reviewedAt = new Date();
    await assessment.save();
  } else if (action === "reject") {
    assessment.status = "Rejected";
    assessment.reviewedAt = new Date();
    await assessment.save();
  } else {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  return NextResponse.json({ status: 200, data: assessment }, { status: 200 });
}
