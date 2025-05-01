import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";
import * as XLSX from 'xlsx';

// Connect to MongoDB
connect();

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
    
    // Transform data for Excel
    const worksheetData = registrations.map(reg => ({
      'Registration ID': reg._id.toString(),
      'Name': reg.name,
      'Event': reg.eventTitle,
      'State': reg.state,
      'City': reg.city,
      'Age': reg.age,
      'Amount Paid': reg.amountPaid,
      'Transaction Number': reg.transactionNumber,
      'Registered At': new Date(reg.registeredAt).toLocaleString()
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="event-registrations-${new Date().toISOString().split('T')[0]}.xlsx"`);
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Return the Excel file as a downloadable response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error("Error exporting registrations:", error);
    return NextResponse.json({ 
      status: 500,
      message: "Error exporting registrations",
      error
    }, { status: 500 });
  }
} 