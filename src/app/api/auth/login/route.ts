import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import ErrorReporter from "@/validator/ErrorReporter";
import { loginSchema } from "@/validator/authValidationSchema";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import vine, { errors } from "@vinejs/vine";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(loginSchema);
    const output = await validator.validate(body);

    const user = await User.findOne({ email: output.email });

    if (user) {
      const checkPassword = bcrypt.compareSync(output.password!, user.password);
      console.log("Password check result:", checkPassword);

      if (checkPassword) {
        return NextResponse.json(
          { status: 200, message: "Credentials valid" },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            status: 400,
            errors: {
              email: "Invalid credentials",
            },
          },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        {
          status: 400,
          errors: {
            email: "No user found with this email",
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { status: 400, errors: error.messages },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}