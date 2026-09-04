import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";
import { Event } from "@/models/Event";
import * as XLSX from 'xlsx';
import { requireAdminSession } from "@/lib/auth";
import { groupRegistrationsByReceipt } from "@/lib/eventRegistrationGroups";

export const dynamic = "force-dynamic";

export const revalidate = 60;

// Connect to MongoDB
connect();

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ status: 403, message: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const eventId = searchParams.get('eventId');
    const receiptNumber = searchParams.get('receiptNumber')?.trim().toLowerCase() || '';
    
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
    
    // Transform data for Excel
    const worksheetData = filtered.flatMap((group) =>
      group.members.map((member, index) => ({
        'Receipt Number': group.receiptNumber,
        'Participants in Receipt': group.participantCount,
        'Primary Email': group.email,
        'Event': group.eventTitle,
        'Member Name': member.name,
        'State': member.state,
        'City': member.city,
        'Age': member.age,
        'Amount Paid': member.amountPaid,
        'Group Total': index === 0 ? group.totalAmount : '',
        'Transaction Number': group.transactionNumber,
        'Registered At': new Date(member.registeredAt).toLocaleString()
      }))
    );
    
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
      error: (error as Error).message
    }, { status: 500 });
  }
} 
