import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";
import { connect } from "@/database/mongo.config";
import { SchoolRegister } from "@/models/SchoolRegister";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const deletedRequest = await SchoolRegister.findByIdAndDelete(params.id);

    if (!deletedRequest) {
      return NextResponse.json({ error: "School request not found" }, { status: 404 });
    }

    return NextResponse.json({ msg: "School request deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete school request:", error);
    return NextResponse.json({ error: "Failed to delete school request" }, { status: 500 });
  }
}
