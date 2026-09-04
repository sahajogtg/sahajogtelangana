import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { Event } from "@/models/Event";

export const dynamic = "force-dynamic";
import { EventRegistration } from "@/models/EventRegistration";
import { EventSubscription } from "@/models/EventSubscription";
import { CenterConnection } from "@/models/CenterConnection";
import { Center } from "@/models/Center";
import { Testimonial } from "@/models/Testimonial";
import { hasFeatureAccess } from "@/lib/roles";

export async function GET(request: NextRequest) {
  await connect();

  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return NextResponse.json({ status: 401, message: "Please log in first." }, { status: 401 });
  }
  const normalizedEmail = normalizeEmail(session.email);

  const user = (await User.findOne({ email: exactEmailMatch(normalizedEmail) }).lean()) as any;
  if (!user) {
    return NextResponse.json({ status: 404, message: "User not found." }, { status: 404 });
  }

  if (!hasFeatureAccess(user.role)) {
    return NextResponse.json(
      { status: 403, message: "This feature is available to Yogis and Volunteers." },
      { status: 403 }
    );
  }

  const [registrations, subscription, testimonials, connections, upcomingEvents] = await Promise.all([
    EventRegistration.find({ email: exactEmailMatch(normalizedEmail) }).sort({ registeredAt: -1 }).lean(),
    EventSubscription.findOne({ email: exactEmailMatch(normalizedEmail) }).lean(),
    Testimonial.find({ email: exactEmailMatch(normalizedEmail) }).sort({ createdAt: -1 }).lean(),
    CenterConnection.find({ userEmail: normalizedEmail, connectionType: "joined" }).lean(),
    Event.find({
      isActive: true,
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: { $exists: false }, date: { $gte: new Date() } },
        { endDate: null, date: { $gte: new Date() } },
      ],
    }).sort({ date: 1 }).limit(4).lean(),
  ]);
  const typedRegistrations = registrations as any[];
  const typedSubscription = subscription as any;
  const typedTestimonials = testimonials as any[];
  const typedConnections = connections as any[];
  const typedUpcomingEvents = upcomingEvents as any[];

  const validEventIds = Array.from(new Set(typedRegistrations.map((registration) => registration.eventId).filter(Boolean)));
  const liveEvents = (await Event.find({ _id: { $in: validEventIds } }, { _id: 1, title: 1, date: 1 }).lean()) as any[];
  const eventMap = new Map(liveEvents.map((event: any) => [String(event._id), event]));
  const eventHistory = typedRegistrations
    .filter((registration) => eventMap.has(String(registration.eventId)))
    .map((registration) => ({
      registrationId: String(registration._id),
      receiptNumber: registration.receiptNumber || String(registration._id).substring(0, 8),
      eventTitle: eventMap.get(String(registration.eventId))?.title || registration.eventTitle,
      registeredAt: registration.registeredAt,
      amountPaid: registration.amountPaid,
      transactionNumber: registration.transactionNumber || "",
    }));
  const eventInterest = Array.from(new Set(eventHistory.map((item) => item.eventTitle))).sort((a, b) => a.localeCompare(b));

  const centerIds = typedConnections.map((connection) => connection.centerId).filter(Boolean);
  const centers = (await Center.find({ _id: { $in: centerIds } }).lean()) as any[];
  const centerMap = new Map(centers.map((center: any) => [String(center._id), center]));
  const joinedCenters = typedConnections
    .filter((connection) => connection.connectionType === "joined")
    .map((connection) => centerMap.get(String(connection.centerId)))
    .filter(Boolean)
    .map((center) => ({
      _id: String(center._id),
      zone: center.zone,
      city: center.city || "Hyderabad",
      day: center.day,
      time: center.time,
      announcement: center.announcement || "",
      weeklyUpdate: center.weeklyUpdate || "",
    }));

  return NextResponse.json({
    status: 200,
    data: {
      profile: {
        name: user.name || "",
        email: user.email,
        city: user.city || "",
        centerInterest: user.centerInterest || "",
        role: user.role || "User",
        eventInterest,
      },
      upcomingEvents: typedUpcomingEvents.map((event: any) => ({
        _id: String(event._id),
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
      })),
      subscribedToNotifications: !!typedSubscription?.isActive,
      joinedCenters,
      testimonials: typedTestimonials.map((testimonial: any) => ({
        _id: String(testimonial._id),
        experience: testimonial.experience,
        isApproved: !!testimonial.isApproved,
        createdAt: testimonial.createdAt,
      })),
      eventHistory,
    },
  }, { status: 200 });
}
