import { NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { FeatureRequest } from "@/models/FeatureRequest";

export const dynamic = "force-dynamic";

export async function GET() {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ status: 403, message: "Unauthorized" }, { status: 403 });
  }

  const requests = await FeatureRequest.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json(requests, { status: 200 });
}
