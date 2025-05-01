import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { CorporateRegister } from "@/models/CorporateRegister";
import { corporateRegisterSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";

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