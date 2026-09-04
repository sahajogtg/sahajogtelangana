import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { DocumentUpload } from "@/models/DocumentUpload";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connect();

    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const status = String(body.status || "").trim();
    const processedSeekers = Number(body.processedSeekers) || 0;
    const notes = String(body.notes || "").trim();

    if (!["processing", "completed", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const upload = await DocumentUpload.findByIdAndUpdate(
      params.id,
      {
        $set: {
          status,
          processedSeekers,
          processedBy: session.user?.email || "",
          processedAt: status === "completed" || status === "failed" ? new Date() : undefined,
          notes,
        },
      },
      { new: true }
    );

    if (!upload) {
      return NextResponse.json({ error: "Document upload not found." }, { status: 404 });
    }

    return NextResponse.json({ data: upload }, { status: 200 });
  } catch (error) {
    console.error("Failed to update document upload:", error);
    return NextResponse.json({ error: "Failed to update document upload." }, { status: 500 });
  }
}
