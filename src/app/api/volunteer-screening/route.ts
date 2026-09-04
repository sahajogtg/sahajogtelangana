import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { VolunteerAssessment } from "@/models/VolunteerAssessment";
import { SCREENING_QUESTIONS, MIN_WHY_WORDS } from "@/data/volunteer-screening";
import { scoreAssessment } from "@/lib/volunteer-screening-score";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s]{10,15}$/;

export async function POST(request: NextRequest) {
  await connect();

  const body = await request.json();

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const city = String(body.city || "").trim();
  const interests = Array.isArray(body.interests)
    ? body.interests.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];
  const availability = String(body.availability || "").trim();
  const experience = String(body.experience || "").trim();
  const answers: Record<string, string> = {};

  if (!name) {
    return NextResponse.json({ status: 400, message: "Please provide your full name." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ status: 400, message: "Please provide a valid email address." }, { status: 400 });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return NextResponse.json({ status: 400, message: "Please provide a valid phone number." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ status: 400, message: "Please select your city." }, { status: 400 });
  }
  if (interests.length === 0) {
    return NextResponse.json({ status: 400, message: "Please select at least one area of interest." }, { status: 400 });
  }
  if (!availability) {
    return NextResponse.json({ status: 400, message: "Please share your availability." }, { status: 400 });
  }

  for (const question of SCREENING_QUESTIONS) {
    const answer = String(body.answers?.[question.id] || "").trim();
    if (!answer) {
      return NextResponse.json(
        { status: 400, message: `Please answer: ${question.prompt}` },
        { status: 400 }
      );
    }
    answers[question.id] = answer;
  }

  const { score, maxScore, wordCount } = scoreAssessment(answers);

  if (wordCount < MIN_WHY_WORDS) {
    return NextResponse.json(
      { status: 400, message: `Please write at least ${MIN_WHY_WORDS} words explaining why you want to volunteer.` },
      { status: 400 }
    );
  }

  const existing = await VolunteerAssessment.findOne({ email });
  if (existing) {
    if (existing.status === "Pending") {
      return NextResponse.json(
        { status: 409, message: "You have already submitted your volunteer screening. The team will review it soon." },
        { status: 409 }
      );
    }
    if (existing.status === "Approved") {
      return NextResponse.json(
        { status: 409, message: "Your application has already been approved. Thank you for volunteering!" },
        { status: 409 }
      );
    }
  }

  const assessment = await VolunteerAssessment.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        phone,
        city,
        interests,
        availability,
        experience,
        answers,
        score,
        maxScore,
        wordCount,
        status: "Pending",
        reviewedAt: null,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(
    { status: 200, message: "Thank you! Your screening answers have been submitted for review.", data: { score, maxScore } },
    { status: 200 }
  );
}
