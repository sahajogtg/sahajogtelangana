import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export const revalidate = 60;

connect();

function buildUpcomingQueryBoundary() {
  const currentDate = new Date();
  const currentDayStart = new Date(currentDate);
  currentDayStart.setHours(0, 0, 0, 0);
  return currentDayStart;
}

function upcomingEventQuery(currentDayStart: Date) {
  return [
    { endDate: { $gte: currentDayStart } },
    { endDate: { $exists: false }, date: { $gte: currentDayStart } },
    { endDate: null, date: { $gte: currentDayStart } },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    const isLoggedIn = !!session?.user;
    const currentDayStart = buildUpcomingQueryBoundary();

    const { searchParams } = request.nextUrl;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;
    const includePast = searchParams.get('includePast') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const query: Record<string, any> = {};

    if (includePast || includeInactive) {
      if (!session || session.user?.role !== 'Admin') {
        return NextResponse.json({
          status: 403,
          message: 'Unauthorized',
        }, { status: 403 });
      }
    }

    if (!includeInactive) {
      query.isActive = true;
    }

    if (!isLoggedIn) {
      query.eventType = 'public_program';
    }

    if (!includePast) {
      query.$or = upcomingEventQuery(currentDayStart);
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(limit);

    return NextResponse.json({
      status: 200,
      message: 'Events fetched successfully',
      data: events,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      status: 500,
      message: 'Unable to fetch events right now.',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== 'Admin') {
      return NextResponse.json({
        status: 403,
        message: 'Unauthorized: Only admins can create events',
      }, { status: 403 });
    }

    const body = await request.json();
    const normalizedBody = {
      ...body,
      eventType: body.eventType || 'public_program',
      endDate: body.endDate || undefined,
    };

    const newEvent = await Event.create(normalizedBody);

    return NextResponse.json({
      status: 201,
      message: 'Event created successfully',
      data: newEvent,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({
      status: 500,
      message: 'Unable to create event right now.',
    }, { status: 500 });
  }
}
