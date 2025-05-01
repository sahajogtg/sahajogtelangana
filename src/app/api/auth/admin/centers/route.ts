import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Center } from "@/models/Center";
import { centerSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";

interface CenterFormPayload {
  address: string;
  day: string;
  time: string;
  contactPersons: string;
  contactNumbers: string;
}

connect();

export async function POST(request: NextRequest) {
  try {
    const body: CenterFormPayload = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(centerSchema);
    const output = await validator.validate(body);

    try {
      await Center.create(output);
      return NextResponse.json(
        { status: 200, msg: "Center added successfully!" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { status: 400, errors: error.messages },
        { status: 200 }
      );
    }
  }
}

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