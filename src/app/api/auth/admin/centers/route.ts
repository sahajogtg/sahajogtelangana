import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Center } from "@/models/Center";
import { centerSchema } from "@/validator/authValidationSchema";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

interface CenterFormPayload {
  address: string;
  day: string;
  time: string;
  zone: string;
  city?: string;
  contactNumbers: string;
  weeklyUpdate?: string;
  announcement?: string;
  link?: string;
}

export async function POST(request: NextRequest) {
  await connect();

  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  await connect();

  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const centers = await Center.find({}).sort({ createdAt: -1 });
    return NextResponse.json(centers, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error("❌ Error fetching centers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
