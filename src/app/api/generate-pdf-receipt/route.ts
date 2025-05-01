import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Connect to MongoDB
connect();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');
    const transactionNumber = searchParams.get('transactionNumber');
    
    if (!registrationId && !transactionNumber) {
      return NextResponse.json({
        status: 400,
        message: "Either registration ID or transaction number is required",
      }, { status: 400 });
    }
    
    // Find registrations
    let registrations;
    if (registrationId) {
      const registration = await EventRegistration.findById(registrationId);
      registrations = registration ? [registration] : [];
    } else if (transactionNumber) {
      registrations = await EventRegistration.find({ transactionNumber });
    }
    
    if (!registrations || registrations.length === 0) {
      return NextResponse.json({
        status: 404,
        message: "No registrations found",
      }, { status: 404 });
    }
    
    // Generate PDF using jsPDF
    const pdf = generatePDF(registrations);
    
    // Set response headers
    const fileName = `Receipt_${transactionNumber || registrationId}.pdf`;
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error("Error generating PDF receipt:", error);
    return NextResponse.json({
      status: 500,
      message: "Error generating PDF receipt",
      error
    }, { status: 500 });
  }
}

function generatePDF(registrations: any[]) {
  const isBulk = registrations.length > 1;
  const firstRegistration = registrations[0];
  const totalAmount = registrations.reduce((sum, reg) => sum + reg.amountPaid, 0);
  const formattedDate = firstRegistration.createdAt 
    ? format(new Date(firstRegistration.createdAt), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');
  
  // Create new PDF document
  const doc = new jsPDF();
  const primaryColor = '#8A1457';
  
  // Add logo and header
  doc.setFontSize(24);
  doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                  parseInt(primaryColor.substring(3, 5), 16), 
                  parseInt(primaryColor.substring(5, 7), 16));
  doc.text('Sahaja Yoga Odisha', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Event Registration Receipt', 14, 28);
  
  // Receipt details
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Receipt #: ${firstRegistration._id.toString().substring(0, 8)}`, 150, 20, { align: 'right' });
  doc.text(`Date: ${formattedDate}`, 150, 28, { align: 'right' });
  
  // Add horizontal line
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);
  
  // Event details
  doc.setFontSize(14);
  doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                  parseInt(primaryColor.substring(3, 5), 16), 
                  parseInt(primaryColor.substring(5, 7), 16));
  doc.text('Event Details', 14, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(firstRegistration.eventTitle, 14, 55);
  
  // Add another horizontal line
  doc.setDrawColor(200);
  doc.line(14, 65, 196, 65);
  
  let currentY = 75;
  
  // Participant details
  if (isBulk) {
    // For bulk registrations, display table
    doc.setFontSize(14);
    doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.text('Participants Information', 14, currentY);
    currentY += 10;
    
    // Create table with participant data
    const tableData = registrations.map((reg) => [
      reg.name,
      `${reg.age} years`,
      `${reg.city}, ${reg.state}`,
      `₹${reg.amountPaid.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      head: [['Name', 'Age', 'Location', 'Amount']],
      body: tableData,
      startY: currentY,
      theme: 'striped',
      headStyles: { 
        fillColor: [
          parseInt(primaryColor.substring(1, 3), 16), 
          parseInt(primaryColor.substring(3, 5), 16), 
          parseInt(primaryColor.substring(5, 7), 16)
        ]
      },
      styles: { fontSize: 10 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    // For single registration
    doc.setFontSize(14);
    doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.text('Participant Information', 14, currentY);
    currentY += 10;
    
    // Grid for participant info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Name:', 14, currentY);
    doc.text('Age:', 105, currentY);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(firstRegistration.name, 30, currentY);
    doc.text(`${firstRegistration.age} years`, 120, currentY);
    
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Location:', 14, currentY);
    doc.text('Email:', 105, currentY);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`${firstRegistration.city}, ${firstRegistration.state}`, 30, currentY);
    doc.text(firstRegistration.email, 120, currentY);
    
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Registration ID:', 14, currentY);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(firstRegistration._id.toString(), 50, currentY);
    
    currentY += 20;
  }
  
  // Add another horizontal line
  doc.setDrawColor(200);
  doc.line(14, currentY - 10, 196, currentY - 10);
  
  // Payment Information
  doc.setFontSize(14);
  doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                  parseInt(primaryColor.substring(3, 5), 16), 
                  parseInt(primaryColor.substring(5, 7), 16));
  doc.text('Payment Information', 14, currentY);
  currentY += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Amount Paid:', 14, currentY);
  doc.text('Transaction ID:', 105, currentY);
  
  doc.setFontSize(11);
  doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                  parseInt(primaryColor.substring(3, 5), 16), 
                  parseInt(primaryColor.substring(5, 7), 16));
  doc.text(`₹${totalAmount.toLocaleString()}`, 50, currentY);
  
  doc.setTextColor(0);
  doc.text(firstRegistration.transactionNumber, 140, currentY);
  
  currentY += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Payment Status:', 14, currentY);
  
  if (isBulk) {
    doc.text('Participants:', 105, currentY);
  }
  
  doc.setFontSize(11);
  doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                  parseInt(primaryColor.substring(3, 5), 16), 
                  parseInt(primaryColor.substring(5, 7), 16));
  doc.text('Confirmed', 50, currentY);
  
  if (isBulk) {
    doc.setTextColor(0);
    doc.text(registrations.length.toString(), 140, currentY);
  }
  
  // Footer
  currentY = 270;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setTextColor(100);
  doc.text('Thank you for registering for the event!', 105, currentY, { align: 'center' });
  doc.text('For any inquiries, please contact us at info@sahajayogaodisha.org', 105, currentY + 8, { align: 'center' });
  
  // Return the PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
} 