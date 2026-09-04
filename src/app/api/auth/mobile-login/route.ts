import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { loginSchema } from "@/validator/authValidationSchema";
import { signMobileToken } from "@/lib/auth";
export const dynamic = "force-dynamic";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    vine.errorReporter = () => new ErrorReporter();
    const validator = vine.compile(loginSchema);
    const output = await validator.validate(body);

    const user = await User.findOne({ email: output.email }).lean() as any;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "This account uses social login. Please sign in with Google or GitHub." },
        { status: 400 }
      );
    }

    const checkPassword = bcrypt.compareSync(output.password!, user.password);
    if (!checkPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = signMobileToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role || "User",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || "",
        role: user.role || "User",
      },
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.messages },
        { status: 400 }
      );
    }
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
