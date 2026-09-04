import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { User } from "@/models/User";
import { registerSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import bcrypt from "bcryptjs";
import { signMobileToken } from "@/lib/auth";
export const dynamic = "force-dynamic";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(registerSchema);
    const output = await validator.validate(body);

    const existing = await User.findOne({ email: output.email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    output.password = bcrypt.hashSync(output.password, salt);
    const newUser = await User.create(output);

    const token = signMobileToken({
      id: String(newUser._id),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role || "User",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: String(newUser._id),
        email: newUser.email,
        name: newUser.name || "",
        role: newUser.role || "User",
      },
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.messages },
        { status: 400 }
      );
    }
    console.error("Mobile register error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
