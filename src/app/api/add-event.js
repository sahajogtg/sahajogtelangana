import { connect } from "@/database/mongo.config";
import { Event } from "@/models/Event";

// This script adds the Shri Krishna Puja 2025 event to the database
// It can be run with Node.js or used as an API route

// Connect to MongoDB
connect();

export async function POST() {
  try {
    // Check if the event already exists
    const existingEvent = await Event.findOne({ 
      title: "Shri Krishna Puja 2025"
    });

    if (existingEvent) {
      return Response.json({ 
        message: "Event already exists",
        status: 200,
        data: existingEvent
      });
    }

    // Create new event
    const eventData = {
      title: "Shri Krishna Puja 2025",
      description: "Join us for the auspicious celebration of Shri Krishna Puja 2025. This three-day event will feature meditation, music, collective gatherings, and special pujas dedicated to Lord Krishna. All Sahaja Yogis and seekers are welcome to attend.",
      date: new Date("2025-08-15"),
      time: "August 15-17, 9:00 AM - 7:00 PM",
      location: "Puri, Odisha",
      image: "/ShriMatajiKrishnaPuja.jpg",
      isActive: true
    };

    const newEvent = await Event.create(eventData);

    return Response.json({ 
      message: "Event created successfully",
      status: 201,
      data: newEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return Response.json({ 
      message: "Error creating event",
      status: 500,
      error: error.message
    }, { status: 500 });
  }
}

// Export GET method for verification
export async function GET() {
  try {
    const event = await Event.findOne({ 
      title: "Shri Krishna Puja 2025"
    });

    if (event) {
      return Response.json({ 
        message: "Event found",
        status: 200,
        data: event
      });
    } else {
      return Response.json({ 
        message: "Event not found",
        status: 404
      }, { status: 404 });
    }
  } catch (error) {
    console.error("Error finding event:", error);
    return Response.json({ 
      message: "Error finding event",
      status: 500,
      error: error.message
    }, { status: 500 });
  }
} 