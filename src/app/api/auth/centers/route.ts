import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Center } from "@/models/Center";
import { centerSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";

connect();

export async function GET() {
  try {
    const centers = await Center.find({}).sort({ createdAt: -1 });
    return NextResponse.json(centers, { status: 200 });
  } catch (error) {
    console.error("Error fetching centers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
