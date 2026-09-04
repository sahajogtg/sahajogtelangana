import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { CorporateRegister } from "@/models/CorporateRegister";
import { corporateRegisterSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { sendEmail } from "@/config/mail";
export const dynamic = "force-dynamic";

interface CorporateRegisterPayload {
  companyName: string;
  contactPerson: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  officeAddress: {
    street: string;
    city: string;
    state: string;
  };
  preferredProgramDate: Date;
  additionalRemarks?: string;
}

connect();

export async function POST(request: NextRequest) {
  try {
    const body: CorporateRegisterPayload = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(corporateRegisterSchema);
    const output = await validator.validate(body);

    try {
      await CorporateRegister.create(output);

      const html = `
        <h2>New Corporate Program Request</h2>
        <p>A corporate registration form submission was received.</p>
        <table style="border-collapse:collapse;">
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Company</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.companyName}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Contact Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.contactPerson.name}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Position</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.contactPerson.position}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.contactPerson.email}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Phone</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.contactPerson.phone}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Office Address</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.officeAddress.street}, ${output.officeAddress.city}, ${output.officeAddress.state}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Preferred Date</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.preferredProgramDate ? new Date(output.preferredProgramDate).toLocaleString() : "-"}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Remarks</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${output.additionalRemarks || "-"}</td></tr>
        </table>
      `;

      const messageId = await sendEmail(
        "csemanish.official@gmail.com",
        "New Corporate Registration",
        html
      );

      if (!messageId) {
        return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
      }

      return NextResponse.json(
        { status: 200, msg: "Corporate registration successful!" },
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
