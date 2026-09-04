import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { connect } from "@/database/mongo.config";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";
import { Testimonial } from "@/models/Testimonial";

export const dynamic = "force-dynamic";

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  await connect();

  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return NextResponse.json(testimonials, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
