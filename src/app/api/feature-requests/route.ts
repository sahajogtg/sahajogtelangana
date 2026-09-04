import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { getSessionFromRequest } from "@/lib/auth";
import { User } from "@/models/User";
import { FeatureRequest } from "@/models/FeatureRequest";
import { sendEmail } from "@/config/mail";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "").trim();
  const useCase = String(body.useCase || "").trim();

  if (!title || !description) {
    return NextResponse.json({ status: 400, message: "Feature title and description are required." }, { status: 400 });
  }

  const user = await User.findOne({ email: session.email }).lean() as any;

  const featureRequest = await FeatureRequest.create({
    userId: user?._id,
    name: session.name || user?.name || "Sahaja Yogi",
    email: session.email,
    title,
    description,
    category,
    useCase,
  });

  const html = `
    <h2>New Feature Request</h2>
    <p>A feature request was submitted for admin review.</p>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Name</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.name}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.email}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Title</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.title}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Category</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.category || "-"}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Description</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.description}</td></tr>
      <tr><td style="padding:6px 10px;border:1px solid #ddd;"><strong>Use Case</strong></td><td style="padding:6px 10px;border:1px solid #ddd;">${featureRequest.useCase || "-"}</td></tr>
    </table>
  `;

  const messageId = await sendEmail(
    "csemanish.official@gmail.com",
    "New Feature Request",
    html
  );

  if (!messageId) {
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }

  return NextResponse.json({
    status: 201,
    message: "Your feature request has been submitted for admin review.",
    data: { id: String(featureRequest._id) },
  }, { status: 201 });
}
