import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";
import { connect } from "@/database/mongo.config";
import { Testimonial } from "@/models/Testimonial";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

async function assertAdmin() {
  const session = (await getServerSession(authOptions)) as CustomSession | null;
  return session && session.user?.role === "Admin" ? session : null;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = await assertAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (typeof body.isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 });
    }

    const isApproved = body.isApproved;

    const testimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      {
        $set: {
          isApproved,
          approvedAt: isApproved ? new Date() : null,
          approvedBy: isApproved ? session.user?.email || "" : "",
        },
      },
      { new: true }
    );

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(
      { msg: isApproved ? "Testimonial approved" : "Testimonial unapproved", data: testimonial },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = await assertAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const testimonial = await Testimonial.findByIdAndDelete(params.id);

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ msg: "Testimonial deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
