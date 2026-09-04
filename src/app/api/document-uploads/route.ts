import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest } from "@/lib/auth";
import { DocumentUpload } from "@/models/DocumentUpload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const session = await getSessionFromRequest(request);
    if (!session?.email) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await request.json();
    const fileName = String(body.fileName || "").trim();
    const fileData = String(body.fileData || "").trim();
    const fileType = String(body.fileType || "").trim();

    if (!fileName || !fileData || !fileType) {
      return NextResponse.json({ error: "File name, data, and type are required." }, { status: 400 });
    }

    if (!["image", "csv", "pdf"].includes(fileType)) {
      return NextResponse.json({ error: "File type must be image, csv, or pdf." }, { status: 400 });
    }

    const upload = await DocumentUpload.create({
      fileName,
      fileData,
      fileType,
      uploadedByName: session.name || "",
      uploadedByEmail: session.email,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Document uploaded successfully. Seekers will be added within 24 hours.", data: { id: upload._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json({ error: "Unable to upload document." }, { status: 500 });
  }
}
