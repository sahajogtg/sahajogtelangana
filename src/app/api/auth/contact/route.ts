import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Contact } from "@/models/Contact";
import { contactSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";

interface ContactFormPayload {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

connect();

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormPayload = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(contactSchema);
    const output = await validator.validate(body);

    try {
      await Contact.create(output);
      return NextResponse.json(
        { status: 200, msg: "Contact form submitted successfully!" },
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