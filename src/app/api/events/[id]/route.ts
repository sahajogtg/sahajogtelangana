import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";
export const dynamic = "force-dynamic";

connect();

function buildUpcomingBoundary() {
  const currentDate = new Date();
  const currentDayStart = new Date(currentDate);
  currentDayStart.setHours(0, 0, 0, 0);
  return currentDayStart;
}

function isUpcomingEvent(event: { date: string | Date; endDate?: string | Date | null }, currentDayStart: Date) {
  const endDate = event.endDate ? new Date(event.endDate) : null;
  if (endDate && !Number.isNaN(endDate.getTime())) {
    return endDate >= currentDayStart;
  }

  const startDate = new Date(event.date);
  return !Number.isNaN(startDate.getTime()) && startDate >= currentDayStart;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json({
        status: 404,
        message: 'Event not found',
      }, { status: 404 });
    }

    if (!session?.user) {
      const currentDayStart = buildUpcomingBoundary();
      const isAllowedForGuest =
        event.isActive !== false
        && event.eventType === 'public_program'
        && isUpcomingEvent(event, currentDayStart);

      if (!isAllowedForGuest) {
        return NextResponse.json({
          status: 404,
          message: 'Event not found',
        }, { status: 404 });
      }
    }

    return NextResponse.json({
      status: 200,
      message: 'Event fetched successfully',
      data: event,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({
      status: 500,
      message: 'Unable to fetch event right now.',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== 'Admin') {
      return NextResponse.json({
        status: 403,
        message: 'Unauthorized: Only admins can update events',
      }, { status: 403 });
    }

    const body = await request.json();
    const normalizedBody = {
      ...body,
      eventType: body.eventType || 'public_program',
      endDate: body.endDate || undefined,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      { $set: normalizedBody },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({
        status: 404,
        message: 'Event not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      message: 'Event updated successfully',
      data: updatedEvent,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({
      status: 500,
      message: 'Unable to update event right now.',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== 'Admin') {
      return NextResponse.json({
        status: 403,
        message: 'Unauthorized: Only admins can delete events',
      }, { status: 403 });
    }

    const deletedEvent = await Event.findByIdAndDelete(params.id);

    if (!deletedEvent) {
      return NextResponse.json({
        status: 404,
        message: 'Event not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      message: 'Event deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({
      status: 500,
      message: 'Unable to delete event right now.',
    }, { status: 500 });
  }
}
