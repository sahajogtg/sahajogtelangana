import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest } from "@/lib/auth";
import { User } from "@/models/User";
import { EventRequest } from "@/models/EventRequest";
import { sendEmail } from "@/config/mail";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const body = await request.json();
  const eventName = String(body.eventName || "").trim();
  const description = String(body.description || "").trim();
  const time = String(body.time || "").trim();
  const location = String(body.location || "").trim();
  const googleMapLink = String(body.googleMapLink || "").trim();
  const contactDetails = String(body.contactDetails || "").trim();
  const additionalNotes = String(body.additionalNotes || "").trim();
  const proposedStartDate = body.proposedStartDate ? new Date(body.proposedStartDate) : null;
  const proposedEndDate = body.proposedEndDate ? new Date(body.proposedEndDate) : null;
  const priceBelow12 = Number.isFinite(Number(body.priceBelow12)) ? Number(body.priceBelow12) : 0;
  const price12To24 = Number.isFinite(Number(body.price12To24)) ? Number(body.price12To24) : 0;
  const price25AndAbove = Number.isFinite(Number(body.price25AndAbove)) ? Number(body.price25AndAbove) : 0;
  const image = String(body.image || "").trim();
  const qrImage = String(body.qrImage || "").trim();

  if (!eventName || !description || !time || !location || !proposedStartDate || Number.isNaN(proposedStartDate.getTime())) {
    return NextResponse.json({
      status: 400,
      message: "Event name, description, proposed date, time, and location are required.",
    }, { status: 400 });
  }

  if (proposedEndDate && !Number.isNaN(proposedEndDate.getTime()) && proposedEndDate < proposedStartDate) {
    return NextResponse.json({
      status: 400,
      message: "The end date cannot be earlier than the start date.",
    }, { status: 400 });
  }

  const user = await User.findOne({ email: session.email }).lean() as any;

  const eventRequest = await EventRequest.create({
    userId: user?._id,
    name: session.name || user?.name || "Sahaja Yogi",
    email: session.email,
    eventName,
    description,
    proposedStartDate,
    proposedEndDate: proposedEndDate && !Number.isNaN(proposedEndDate.getTime()) ? proposedEndDate : undefined,
    time,
    location,
    googleMapLink,
    contactDetails,
    priceBelow12,
    price12To24,
    price25AndAbove,
    image,
    qrImage,
    additionalNotes,
  });

  const html = `
    <h2>New Event Request</h2>
    <p>An event request was submitted for admin review.</p>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.name}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.email}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Event Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.eventName}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Description</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.description}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Start Date</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.proposedStartDate ? new Date(eventRequest.proposedStartDate).toLocaleString() : "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>End Date</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.proposedEndDate ? new Date(eventRequest.proposedEndDate).toLocaleString() : "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Time</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.time}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Location</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.location}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Google Map</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.googleMapLink || "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Contact Details</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.contactDetails || "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Price Below 12</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.priceBelow12 ?? 0}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Price 12 to 24</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.price12To24 ?? 0}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Price 25 and Above</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.price25AndAbove ?? 0}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Image</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.image || "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>QR Image</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.qrImage || "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Additional Notes</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${eventRequest.additionalNotes || "-"}</td></tr>
    </table>
  `;

  const messageId = await sendEmail(
    "csemanish.official@gmail.com",
    "New Event Request",
    html
  );

  if (!messageId) {
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }

  return NextResponse.json({
    status: 201,
    message: "Your event request has been submitted for admin review.",
    data: { id: String(eventRequest._id) },
  }, { status: 201 });
}
