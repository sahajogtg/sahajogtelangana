import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";

// Connect to MongoDB
connect();

// GET a specific event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await Event.findById(params.id);
    
    if (!event) {
      return NextResponse.json({
        status: 404,
        message: "Event not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 200,
      message: "Event fetched successfully",
      data: event
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({
      status: 500,
      message: "Error fetching event",
      error
    }, { status: 500 });
  }
}

// UPDATE an event by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({
        status: 403,
        message: "Unauthorized: Only admins can update events"
      }, { status: 403 });
    }
    
    const body = await request.json();
    
    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return NextResponse.json({
        status: 404,
        message: "Event not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 200,
      message: "Event updated successfully",
      data: updatedEvent
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({
      status: 500,
      message: "Error updating event",
      error
    }, { status: 500 });
  }
}

// DELETE an event by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({
        status: 403,
        message: "Unauthorized: Only admins can delete events"
      }, { status: 403 });
    }
    
    const deletedEvent = await Event.findByIdAndDelete(params.id);
    
    if (!deletedEvent) {
      return NextResponse.json({
        status: 404,
        message: "Event not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 200,
      message: "Event deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({
      status: 500,
      message: "Error deleting event",
      error
    }, { status: 500 });
  }
} 