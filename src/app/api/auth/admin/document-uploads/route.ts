import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { DocumentUpload } from "@/models/DocumentUpload";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connect();

    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const uploads = await DocumentUpload.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ data: uploads }, { status: 200 });
  } catch (error) {
    console.error("Failed to load document uploads:", error);
    return NextResponse.json({ error: "Failed to load document uploads." }, { status: 500 });
  }
}
