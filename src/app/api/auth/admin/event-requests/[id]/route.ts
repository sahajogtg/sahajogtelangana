import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from "@/lib/auth";
import { EventRequest } from "@/models/EventRequest";
import { Event } from "@/models/Event";
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

  const eventRequest = await EventRequest.findById(params.id);
  if (!eventRequest) {
    return NextResponse.json({ status: 404, message: "Event request not found." }, { status: 404 });
  }

  let approvedEventId = eventRequest.approvedEventId;

  if (status === "Approved" && !approvedEventId) {
    const description = eventRequest.additionalNotes
      ? `${eventRequest.description}\n\nAdditional notes: ${eventRequest.additionalNotes}`
      : eventRequest.description;

    const event = await Event.create({
      title: eventRequest.eventName,
      description,
      date: eventRequest.proposedStartDate,
      endDate: eventRequest.proposedEndDate || undefined,
      time: eventRequest.time,
      location: eventRequest.location,
      googleMapLink: eventRequest.googleMapLink || "",
      contactDetails: eventRequest.contactDetails || eventRequest.email,
      priceBelow12: eventRequest.priceBelow12 ?? 0,
      price12To24: eventRequest.price12To24 ?? 0,
      price25AndAbove: eventRequest.price25AndAbove ?? 0,
      image: eventRequest.image || "",
      qrImage: eventRequest.qrImage || "",
      isActive: true,
    });
    approvedEventId = event._id;
  }

  eventRequest.status = status;
  eventRequest.adminNotes = adminNotes;
  eventRequest.reviewedAt = status === "Pending" ? undefined : new Date();
  eventRequest.reviewedBy = status === "Pending" ? "" : session.user?.email || "";
  eventRequest.approvedEventId = status === "Approved" ? approvedEventId : undefined;

  await eventRequest.save();

  return NextResponse.json({
    status: 200,
    message: status === "Approved" ? "Event request approved and published." : "Event request updated successfully.",
    data: eventRequest,
  }, { status: 200 });
}
