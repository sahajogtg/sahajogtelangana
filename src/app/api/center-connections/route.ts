import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { CenterConnection } from "@/models/CenterConnection";
import { getSessionFromRequest } from "@/lib/auth";
import { sendEmail } from "@/config/mail";
import { Center } from "@/models/Center";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";

function toObjectId(value: string) {
  return new mongoose.Types.ObjectId(value);
}

export async function GET(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const email = session.email.toLowerCase();
  const connections = await CenterConnection.find({ userEmail: email, connectionType: "joined" }).lean();
  return NextResponse.json({
    status: 200,
    data: connections.map((connection: any) => ({
      _id: String(connection._id),
      userId: connection.userId ? String(connection.userId) : "",
      userEmail: connection.userEmail,
      centerId: String(connection.centerId),
      connectionType: connection.connectionType,
      createdAt: connection.createdAt,
    })),
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const body = await request.json();
  const centerId = String(body.centerId || "").trim();
  const connectionType = "joined";
  const email = session.email.toLowerCase();

  if (!centerId || !mongoose.Types.ObjectId.isValid(centerId)) {
    return NextResponse.json({ status: 400, message: "Center is required." }, { status: 400 });
  }

  const connection = await CenterConnection.findOneAndUpdate(
    { userEmail: email, centerId: toObjectId(centerId), connectionType },
    {
      $setOnInsert: {
        userId: session.id && mongoose.Types.ObjectId.isValid(session.id) ? toObjectId(session.id) : undefined,
        userEmail: email,
        centerId: toObjectId(centerId),
        connectionType,
      },
    },
    { upsert: true, new: true }
  );

  if (connectionType === "joined" && session.email) {
    const center = (await Center.findById(centerId).lean()) as any;
    if (center) {
      try {
        await sendEmail(
          session.email,
          `You joined updates for ${center.zone}`,
          `<div style="font-family:Arial,sans-serif;line-height:1.6"><p>Namaste ${session.name || ""},</p><p>You will now receive email updates related to the <strong>${center.zone}</strong> center in ${center.city || "Hyderabad"}.</p><p>Weekly updates and announcements from the center team will come to this email.</p></div>`
        );
      } catch (error) {
        console.error("Failed to send center follow confirmation email:", error);
      }
    }
  }

  return NextResponse.json({ status: 200, data: connection }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const centerId = searchParams.get("centerId");
  const connectionType = "joined";
  const email = session.email.toLowerCase();

  if (!centerId || !mongoose.Types.ObjectId.isValid(centerId)) {
    return NextResponse.json({ status: 400, message: "Center is required." }, { status: 400 });
  }

  await CenterConnection.findOneAndDelete({
    userEmail: email,
    centerId: toObjectId(centerId),
    connectionType,
  });
  return NextResponse.json({ status: 200, message: "Center preference removed." }, { status: 200 });
}
