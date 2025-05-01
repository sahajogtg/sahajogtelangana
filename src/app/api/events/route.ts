import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";

// Connect to MongoDB
connect();

// GET handler for fetching all events
export async function GET(request: NextRequest) {
  try {
    // Get current date to filter for upcoming events
    const currentDate = new Date();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    // Find upcoming events (where date is greater than or equal to today)
    const events = await Event.find({ 
      date: { $gte: currentDate },
      isActive: true 
    })
    .sort({ date: 1 }) // Sort by date ascending (closest first)
    .limit(limit);
    
    return NextResponse.json({ 
      status: 200,
      message: "Events fetched successfully",
      data: events
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ 
      status: 500,
      message: "Error fetching events",
      error
    }, { status: 500 });
  }
}

// POST handler for creating new events (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({
        status: 403,
        message: "Unauthorized: Only admins can create events"
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Create new event
    const newEvent = await Event.create(body);
    
    return NextResponse.json({
      status: 201,
      message: "Event created successfully",
      data: newEvent
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({
      status: 500,
      message: "Error creating event",
      error
    }, { status: 500 });
  }
} 