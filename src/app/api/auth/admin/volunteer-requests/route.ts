import { NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { VolunteerRequest } from "@/models/VolunteerRequest";

export const dynamic = "force-dynamic";

export async function GET() {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const requests = await VolunteerRequest.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ status: 200, data: requests }, { status: 200 });
}
