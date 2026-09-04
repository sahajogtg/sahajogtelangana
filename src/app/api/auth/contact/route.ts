import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Contact } from "@/models/Contact";
import { contactSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { sendEmail } from "@/config/mail";
export const dynamic = "force-dynamic";

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

      const html = `
        <h2>New Contact Request</h2>
        <p>A new contact-us form submission was received.</p>
        <table style="border-collapse:collapse;">
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.name}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.email}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Phone</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.phoneNumber}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Message</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.message}</td></tr>
        </table>
      `;

      const messageId = await sendEmail(
        "csemanish.official@gmail.com",
        "New Contact Form Submission",
        html
      );

      if (!messageId) {
        return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
      }

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
