import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";

// Connect to MongoDB
connect();

// GET handler for fetching registrations by transaction number
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const transactionNumber = searchParams.get('transactionNumber');
    const name = searchParams.get('name');
    
    // Check if at least one search parameter is provided
    if (!transactionNumber && !name) {
      return NextResponse.json({
        status: 400,
        message: "At least one search parameter (transaction number or name) is required",
      }, { status: 400 });
    }
    
    // Build query based on provided parameters
    const query: any = {};
    if (transactionNumber) {
      query.transactionNumber = transactionNumber;
    }
    if (name) {
      // Case-insensitive partial name search
      query.name = { $regex: name, $options: 'i' };
    }
    
    // Find registrations by query
    const registrations = await EventRegistration.find(query)
      .sort({ registeredAt: -1 }); // Latest first
    
    if (registrations.length === 0) {
      return NextResponse.json({
        status: 404,
        message: "No registrations found with the provided information",
      }, { status: 404 });
    }
    
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