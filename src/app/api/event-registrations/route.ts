import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";

// Connect to MongoDB
connect();

// POST handler for creating new event registrations
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Check if this is a bulk registration or single registration
    if (body.participants && Array.isArray(body.participants)) {
      // Bulk registration
      const { eventId, eventTitle, transactionNumber, participants } = body;
      
      // Validate base required fields
      if (!eventId || !eventTitle || !transactionNumber || !participants.length) {
        return NextResponse.json({
          status: 400,
          message: "Event ID, event title, transaction number, and at least one participant are required",
        }, { status: 400 });
      }
      
      // Check for duplicate transaction number
      const existingRegistrationWithTransactionNumber = await EventRegistration.findOne({ 
        transactionNumber 
      });
      
      if (existingRegistrationWithTransactionNumber) {
        return NextResponse.json({
          status: 400,
          message: "A registration with this transaction number already exists. Please check and try again with a different transaction number.",
        }, { status: 400 });
      }
      
      // Validate each participant and calculate total amount
      let totalExpectedAmount = 0;
      const registrations = [];
      const participantRequiredFields = ['name', 'state', 'city', 'age', 'email'];
      
      // Check for duplicate names within this event
      for (const participant of participants) {
        // Validate required fields for each participant
        for (const field of participantRequiredFields) {
          if (!participant[field]) {
            return NextResponse.json({
              status: 400,
              message: `${field} is required for all participants`,
            }, { status: 400 });
          }
        }
        
        // Check if this person has already registered for this event
        const existingRegistration = await EventRegistration.findOne({
          eventId,
          name: participant.name
        });
        
        if (existingRegistration) {
          return NextResponse.json({
            status: 400,
            message: `${participant.name} has already registered for this event.`,
          }, { status: 400 });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(participant.email)) {
          return NextResponse.json({
            status: 400,
            message: `Invalid email format for participant: ${participant.name}`,
          }, { status: 400 });
        }
        
        // Calculate expected amount based on age
        const age = parseInt(participant.age);
        let expectedAmount = 0;
        
        if (age < 12) {
          expectedAmount = 1000;
        } else if (age >= 12 && age < 25) {
          expectedAmount = 1800;
        } else {
          expectedAmount = 2600;
        }
        
        totalExpectedAmount += expectedAmount;
        
        // Prepare registration data
        registrations.push({
          eventId,
          eventTitle,
          name: participant.name,
          state: participant.state,
          city: participant.city,
          age,
          email: participant.email,
          transactionNumber,
          amountPaid: expectedAmount
        });
      }
      
      // Check if amount matches expected amount based on all participants
      if (body.totalAmountPaid !== totalExpectedAmount) {
        return NextResponse.json({
          status: 400,
          message: `Invalid total amount. Expected ₹${totalExpectedAmount} for all participants`,
        }, { status: 400 });
      }
      
      // Create new registrations
      const newRegistrations = await EventRegistration.insertMany(registrations);
      
      return NextResponse.json({
        status: 201,
        message: "Bulk registration successful",
        data: newRegistrations
      }, { status: 201 });
    } else {
      // Single registration (existing logic)
      // Validate required fields
      const requiredFields = ['eventId', 'eventTitle', 'name', 'state', 'city', 'age', 'email', 'transactionNumber', 'amountPaid'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json({
            status: 400,
            message: `${field} is required`,
          }, { status: 400 });
        }
      }
      
      // Check for duplicate transaction number
      const existingRegistrationWithTransactionNumber = await EventRegistration.findOne({ 
        transactionNumber: body.transactionNumber 
      });
      
      if (existingRegistrationWithTransactionNumber) {
        return NextResponse.json({
          status: 400,
          message: "A registration with this transaction number already exists. Please check and try again with a different transaction number.",
        }, { status: 400 });
      }
      
      // Check if this person has already registered for this event
      const existingRegistration = await EventRegistration.findOne({
        eventId: body.eventId,
        name: body.name
      });
      
      if (existingRegistration) {
        return NextResponse.json({
          status: 400,
          message: `${body.name} has already registered for this event.`,
        }, { status: 400 });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({
          status: 400,
          message: "Invalid email format",
        }, { status: 400 });
      }
      
      // Validate age and amount
      const age = parseInt(body.age);
      let expectedAmount = 0;
      
      if (age < 12) {
        expectedAmount = 1000;
      } else if (age >= 12 && age < 25) {
        expectedAmount = 1800;
      } else {
        expectedAmount = 2600;
      }
      
      // Check if amount matches expected amount based on age
      if (body.amountPaid !== expectedAmount) {
        return NextResponse.json({
          status: 400,
          message: `Invalid amount. Expected ₹${expectedAmount} for age ${age}`,
        }, { status: 400 });
      }
      
      // Create new registration
      const newRegistration = await EventRegistration.create(body);
      
      return NextResponse.json({
        status: 201,
        message: "Registration successful",
        data: newRegistration
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json({
      status: 500,
      message: "Error creating registration",
      error
    }, { status: 500 });
  }
}

// GET handler for fetching all registrations (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    // Build query
    const query: any = {};
    if (eventId) {
      query.eventId = eventId;
    }
    
    // Find registrations
    const registrations = await EventRegistration.find(query)
      .sort({ registeredAt: -1 }); // Latest first
    
    return NextResponse.json({ 
      status: 200,
      message: "Registrations fetched successfully",
      data: registrations
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ 
      status: 500,
      message: "Error fetching registrations",
      error
    }, { status: 500 });
  }
} 