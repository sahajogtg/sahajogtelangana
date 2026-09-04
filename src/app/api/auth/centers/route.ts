import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Center } from "@/models/Center";
import { centerSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";

export const dynamic = "force-dynamic";

connect();

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET() {
  try {
    const centers = await Center.find({}).sort({ createdAt: -1 });
    return NextResponse.json(centers, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error("Error fetching centers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
