import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";
import { Event } from "@/models/Event";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/auth";
import { groupRegistrationsByReceipt } from "@/lib/eventRegistrationGroups";
export const dynamic = "force-dynamic";

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
      const { eventId, eventTitle, transactionNumber, participants, sharedDetails } = body;
      const event = await Event.findById(eventId);

      if (!event) {
        return NextResponse.json({
          status: 404,
          message: "Event not found",
        }, { status: 404 });
      }

      const pricing = {
        below12: event.priceBelow12 ?? 1000,
        age12To24: event.price12To24 ?? 1800,
        age25AndAbove: event.price25AndAbove ?? 2600,
      };
      const isFreeEvent =
        pricing.below12 === 0 &&
        pricing.age12To24 === 0 &&
        pricing.age25AndAbove === 0;
      
      // Validate base required fields
      if (!eventId || !eventTitle || !participants.length || !sharedDetails?.state || !sharedDetails?.city || !sharedDetails?.email || (!isFreeEvent && !transactionNumber)) {
        return NextResponse.json({
          status: 400,
          message: "Event ID, event title, shared state/city/email, and at least one participant are required. Transaction number is required for paid events.",
        }, { status: 400 });
      }
      
      // Check for duplicate transaction number
      if (!isFreeEvent && transactionNumber) {
        const existingRegistrationWithTransactionNumber = await EventRegistration.findOne({ 
          transactionNumber 
        });
        
        if (existingRegistrationWithTransactionNumber) {
          return NextResponse.json({
            status: 400,
            message: "A registration with this transaction number already exists. Please check and try again with a different transaction number.",
          }, { status: 400 });
        }
      }
      
      // Validate each participant and calculate total amount
      let totalExpectedAmount = 0;
      const registrations = [];
      const participantRequiredFields = ['name', 'age'];
      const bulkGroupId = new mongoose.Types.ObjectId().toString();
      const receiptNumber = new mongoose.Types.ObjectId().toString().substring(0, 8);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sharedDetails.email)) {
        return NextResponse.json({
          status: 400,
          message: "Invalid email format for shared contact email",
        }, { status: 400 });
      }
      
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
        
        // // Check if this person has already registered for this event
        // const existingRegistration = await EventRegistration.findOne({
        //   eventId,
        //   name: participant.name
        // });
        
        // if (existingRegistration) {
        //   return NextResponse.json({
        //     status: 400,
        //     message: `${participant.name} has already registered for this event.`,
        //   }, { status: 400 });
        // }
        
        // Calculate expected amount based on age
        const age = parseInt(participant.age);
        let expectedAmount = 0;
        
        if (age < 12) {
          expectedAmount = pricing.below12;
        } else if (age >= 12 && age < 25) {
          expectedAmount = pricing.age12To24;
        } else {
          expectedAmount = pricing.age25AndAbove;
        }
        
        totalExpectedAmount += expectedAmount;
        
        // Prepare registration data
        registrations.push({
          eventId,
          eventTitle,
          name: participant.name,
          state: sharedDetails.state,
          city: sharedDetails.city,
          age,
          email: sharedDetails.email,
          transactionNumber: isFreeEvent ? '' : transactionNumber,
          amountPaid: expectedAmount,
          bulkGroupId,
          receiptNumber,
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
      const event = await Event.findById(body.eventId);

      if (!event) {
        return NextResponse.json({
          status: 404,
          message: "Event not found",
        }, { status: 404 });
      }

      const pricing = {
        below12: event.priceBelow12 ?? 1000,
        age12To24: event.price12To24 ?? 1800,
        age25AndAbove: event.price25AndAbove ?? 2600,
      };
      const isFreeEvent =
        pricing.below12 === 0 &&
        pricing.age12To24 === 0 &&
        pricing.age25AndAbove === 0;
      const requiredFields = ['eventId', 'eventTitle', 'name', 'state', 'city', 'age', 'email'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json({
            status: 400,
            message: `${field} is required`,
          }, { status: 400 });
        }
      }
      if (!isFreeEvent && !body.transactionNumber) {
        return NextResponse.json({
          status: 400,
          message: "transactionNumber is required",
        }, { status: 400 });
      }
      
      // Check for duplicate transaction number
      if (!isFreeEvent && body.transactionNumber) {
        const existingRegistrationWithTransactionNumber = await EventRegistration.findOne({ 
          transactionNumber: body.transactionNumber 
        });
        
        if (existingRegistrationWithTransactionNumber) {
          return NextResponse.json({
            status: 400,
            message: "A registration with this transaction number already exists. Please check and try again with a different transaction number.",
          }, { status: 400 });
        }
      }
      
      // Check if this person has already registered for this event
      // const existingRegistration = await EventRegistration.findOne({
      //   eventId: body.eventId,
      //   name: body.name
      // });
      
      // if (existingRegistration) {
      //   return NextResponse.json({
      //     status: 400,
      //     message: `${body.name} has already registered for this event.`,
      //   }, { status: 400 });
      // }
      
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
      const registrationId = new mongoose.Types.ObjectId();
      const receiptNumber = registrationId.toString().substring(0, 8);
      let expectedAmount = 0;
      
      if (age < 12) {
        expectedAmount = pricing.below12;
      } else if (age >= 12 && age < 25) {
        expectedAmount = pricing.age12To24;
      } else {
        expectedAmount = pricing.age25AndAbove;
      }
      
      // Check if amount matches expected amount based on age
      if (body.amountPaid !== undefined && body.amountPaid !== expectedAmount) {
        return NextResponse.json({
          status: 400,
          message: `Invalid amount. Expected ₹${expectedAmount} for age ${age}`,
        }, { status: 400 });
      }
      
      // Create new registration
      const newRegistration = await EventRegistration.create({
        _id: registrationId,
        ...body,
        amountPaid: expectedAmount,
        transactionNumber: isFreeEvent ? '' : body.transactionNumber,
        receiptNumber,
      });
      
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
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({
        status: 403,
        message: "Unauthorized",
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const receiptNumber = searchParams.get('receiptNumber')?.trim().toLowerCase() || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '12', 10), 1), 50);
    
    // Build query
    const query: any = {};
    const validEventIds = (await Event.find(eventId ? { _id: eventId } : {}, { _id: 1 }).lean()).map((event: any) => String(event._id));
    query.eventId = { $in: validEventIds };
    
    // Find registrations
    const registrations = await EventRegistration.find(query)
      .sort({ registeredAt: -1 })
      .lean();

    const grouped = groupRegistrationsByReceipt(registrations as any);
    const filtered = receiptNumber
      ? grouped.filter((group) => group.receiptNumber.toLowerCase().includes(receiptNumber))
      : grouped;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    
    return NextResponse.json({ 
      status: 200,
      message: "Registrations fetched successfully",
      data: paginated,
      meta: {
        page,
        pageSize,
        totalGroups: filtered.length,
        totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
      },
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
