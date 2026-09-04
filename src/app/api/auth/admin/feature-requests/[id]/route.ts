import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { FeatureRequest } from "@/models/FeatureRequest";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ status: 403, message: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const status = String(body.status || "").trim();
  const adminNotes = String(body.adminNotes || "").trim();

  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return NextResponse.json({ status: 400, message: "Invalid status." }, { status: 400 });
  }

  const featureRequest = await FeatureRequest.findByIdAndUpdate(
    params.id,
    {
      status,
      adminNotes,
      reviewedAt: status === "Pending" ? undefined : new Date(),
      reviewedBy: status === "Pending" ? "" : session.user?.email || "",
    },
    { new: true }
  ).lean();

  if (!featureRequest) {
    return NextResponse.json({ status: 404, message: "Feature request not found." }, { status: 404 });
  }

  return NextResponse.json({
    status: 200,
    message: "Feature request updated successfully.",
    data: featureRequest,
  }, { status: 200 });
}
