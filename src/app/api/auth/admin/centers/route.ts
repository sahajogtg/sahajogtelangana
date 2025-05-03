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

export async function POST(request: NextRequest) {
  await connect();

  try {
    const body: CenterFormPayload = await request.json();

    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(centerSchema);
    const output = await validator.validate(body);

    await Center.create(output);

    console.log("✅ Center created successfully:", output);

    return NextResponse.json({ msg: "Center added successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error adding center:", error);

    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json({ errors: error.messages }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  await connect();

  try {
    const centers = await Center.find({}).sort({ createdAt: -1 });
    return NextResponse.json(centers, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching centers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
