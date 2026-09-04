import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { Testimonial } from "@/models/Testimonial";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json(
      { status: 401, message: "Please log in to share your experience." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const experience = String(body.experience || "").trim();
    const city = String(body.city || "").trim();
    const yearsInSahajaYoga = String(body.yearsInSahajaYoga || "").trim();

    if (experience.length < 40) {
      return NextResponse.json(
        { status: 400, message: "Please share at least a few lines about your experience." },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.create({
      userId: session.id,
      name: session.name || "Sahaja Yogi",
      email: normalizeEmail(session.email),
      city,
      yearsInSahajaYoga,
      experience,
      isApproved: false,
    });

    return NextResponse.json(
      { status: 201, message: "Thank you for sharing your experience.", data: testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { status: 500, message: "Unable to save your experience right now." },
      { status: 500 }
    );
  }
}
