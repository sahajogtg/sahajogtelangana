import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";
import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";
import { notifyEventSubscribers } from "@/lib/eventNotifications";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteContext) {
  await connect();

  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ status: 403, message: "Unauthorized" }, { status: 403 });
  }

  try {
    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json({ status: 404, message: "Event not found" }, { status: 404 });
    }

    const eventDate = new Date(event.date);
    if (Number.isNaN(eventDate.getTime()) || eventDate < new Date()) {
      return NextResponse.json(
        { status: 400, message: "Subscriber notifications are only sent for upcoming events." },
        { status: 400 }
      );
    }

    if (event.subscriberNotificationSentAt) {
      return NextResponse.json(
        { status: 409, message: "Subscribers have already been notified for this event." },
        { status: 409 }
      );
    }

    const notificationResult = await notifyEventSubscribers({
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      googleMapLink: event.googleMapLink,
      contactDetails: event.contactDetails,
    });

    const allDelivered = notificationResult.total === 0 || notificationResult.delivered === notificationResult.total;

    if (allDelivered) {
      event.subscriberNotificationSentAt = new Date();
      await event.save();
    }

    return NextResponse.json(
      {
        status: allDelivered ? 200 : 207,
        message: allDelivered
          ? `Subscriber notifications sent to ${notificationResult.delivered} of ${notificationResult.total} recipients.`
          : `Subscriber notifications sent to ${notificationResult.delivered} of ${notificationResult.total} recipients. You can retry to notify the remaining subscribers.`,
      },
      { status: allDelivered ? 200 : 207 }
    );
  } catch (error) {
    console.error("Error notifying event subscribers:", error);
    return NextResponse.json(
      { status: 500, message: "Unable to notify subscribers right now." },
      { status: 500 }
    );
  }
}
