import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { EventRegistration } from "@/models/EventRegistration";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const dynamic = "force-dynamic";

export const revalidate = 60;

connect();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const registrationId = searchParams.get('registrationId');
    const transactionNumber = searchParams.get('transactionNumber');

    if (!registrationId && !transactionNumber) {
      return NextResponse.json({
        status: 400,
        message: "Either registration ID or transaction number is required",
      }, { status: 400 });
    }

    let registrations: any[] = [];

    if (registrationId) {
      const registration = await EventRegistration.findById(registrationId);

      if (registration?.bulkGroupId) {
        registrations = await EventRegistration.find({ bulkGroupId: registration.bulkGroupId }).sort({ registeredAt: 1 });
      } else if (registration?.transactionNumber) {
        registrations = await EventRegistration.find({ transactionNumber: registration.transactionNumber }).sort({ registeredAt: 1 });
      } else if (registration) {
        const registeredAt = registration.registeredAt ? new Date(registration.registeredAt) : null;
        const fallbackBulkQuery: Record<string, unknown> = {
          _id: { $ne: registration._id },
          eventId: registration.eventId,
          email: registration.email,
          transactionNumber: { $in: ['', null] },
          amountPaid: registration.amountPaid,
        };

        if (registeredAt && !Number.isNaN(registeredAt.getTime())) {
          const start = new Date(registeredAt.getTime() - 60 * 1000);
          const end = new Date(registeredAt.getTime() + 60 * 1000);
          fallbackBulkQuery.registeredAt = { $gte: start, $lte: end };
        }

        const siblingRegistrations = await EventRegistration.find(fallbackBulkQuery).sort({ registeredAt: 1 });

        if (siblingRegistrations.length > 0) {
          registrations = [registration, ...siblingRegistrations].sort(
            (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
          );
        } else {
          registrations = [registration];
        }
      }
    } else if (transactionNumber) {
      registrations = await EventRegistration.find({ transactionNumber }).sort({ registeredAt: 1 });
    }

    if (!registrations.length) {
      return NextResponse.json({
        status: 404,
        message: "No registrations found",
      }, { status: 404 });
    }

    const pdf = generatePDF(registrations);
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
      error: (error as Error).message,
    }, { status: 500 });
  }
}

function generatePDF(registrations: any[]) {
  const isBulk = registrations.length > 1;
  const firstRegistration = registrations[0];
  const totalAmount = registrations.reduce((sum, reg) => sum + reg.amountPaid, 0);
  const isFreeEvent = totalAmount === 0;
  const formattedDate = firstRegistration.registeredAt
    ? format(new Date(firstRegistration.registeredAt), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = '#8A1457';
  const inkColor = '#2C2A28';
  const mutedColor = '#6C6A66';
  const softAccent = '#F8ECF2';
  const borderColor = [232, 225, 215] as [number, number, number];
  const shellX = 34;
  const shellY = 34;
  const shellWidth = pageWidth - shellX * 2;
  const shellHeight = pageHeight - shellY * 2;
  const contentLeft = shellX + 28;
  const contentRight = pageWidth - shellX - 28;

  doc.setFillColor(251, 248, 244);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(shellX, shellY, shellWidth, shellHeight, 20, 20, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(shellX, shellY, shellWidth, shellHeight, 20, 20, 'S');

  doc.setFillColor(248, 236, 242);
  doc.roundedRect(contentLeft, 54, shellWidth - 56, 98, 18, 18, 'F');

  doc.setFontSize(22);
  doc.setTextColor(primaryColor);
  doc.text('Sahaja Yoga Telangana', contentLeft + 16, 92);

  doc.setFontSize(11);
  doc.setTextColor(mutedColor);
  doc.text(isBulk ? 'Bulk Event Registration Receipt' : 'Event Registration Receipt', contentLeft + 16, 114);
  doc.text(`Receipt #: ${firstRegistration._id.toString().substring(0, 8)}`, contentRight - 8, 92, { align: 'right' });
  doc.text(`Date: ${formattedDate}`, contentRight - 8, 114, { align: 'right' });

  let currentY = 188;

  doc.setFontSize(13);
  doc.setTextColor(primaryColor);
  doc.text('Event Details', contentLeft, currentY);
  currentY += 24;

  doc.setFontSize(17);
  doc.setTextColor(inkColor);
  doc.text(firstRegistration.eventTitle, contentLeft, currentY);
  currentY += 24;

  doc.setFontSize(10);
  doc.setTextColor(mutedColor);
  doc.text(`Location: ${firstRegistration.city}, ${firstRegistration.state}`, contentLeft, currentY);
  currentY += 16;
  doc.text(`Registration Type: ${isBulk ? 'Bulk' : 'Individual'}`, contentLeft, currentY);
  currentY += 28;

  if (isBulk) {
    doc.setFontSize(13);
    doc.setTextColor(primaryColor);
    doc.text('Participants', contentLeft, currentY);
    currentY += 16;

    autoTable(doc, {
      head: [['Name', 'Age', 'Location', 'Amount']],
      body: registrations.map((reg) => [
        reg.name,
        `${reg.age} years`,
        `${reg.city}, ${reg.state}`,
        `₹${reg.amountPaid.toLocaleString()}`,
      ]),
      startY: currentY,
      theme: 'grid',
      margin: { left: contentLeft, right: shellX + 28 },
      headStyles: {
        fillColor: primaryColor,
        textColor: '#FFFFFF',
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: inkColor,
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: softAccent,
      },
      styles: {
        lineColor: borderColor,
        lineWidth: 1,
        cellPadding: 8,
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  } else {
    doc.setFontSize(13);
    doc.setTextColor(primaryColor);
    doc.text('Participant Details', contentLeft, currentY);
    currentY += 16;

    autoTable(doc, {
      body: [
        ['Name', firstRegistration.name],
        ['Age', `${firstRegistration.age} years`],
        ['Location', `${firstRegistration.city}, ${firstRegistration.state}`],
        ['Email', firstRegistration.email],
          ['Receipt Number', firstRegistration._id.toString().substring(0, 8)],
      ],
      startY: currentY,
      theme: 'grid',
      margin: { left: contentLeft, right: shellX + 28 },
      styles: {
        fontSize: 10,
        textColor: inkColor,
        lineColor: borderColor,
        lineWidth: 1,
        cellPadding: 8,
      },
      columnStyles: {
        0: {
          fillColor: softAccent,
          fontStyle: 'bold',
          cellWidth: 120,
        },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  }

  doc.setFontSize(13);
  doc.setTextColor(primaryColor);
  doc.text(isFreeEvent ? 'Registration Summary' : 'Payment Summary', contentLeft, currentY);
  currentY += 16;

  autoTable(doc, {
    body: isFreeEvent
      ? [
          ['Amount Paid', '₹0'],
          ['Registration Type', 'Free Entry'],
          ...(isBulk ? [['Participants', registrations.length.toString()]] : []),
        ]
      : [
          ['Amount Paid', `₹${totalAmount.toLocaleString()}`],
          ['Transaction ID', firstRegistration.transactionNumber || '-'],
          ['Payment Status', 'Confirmed'],
          ...(isBulk ? [['Participants', registrations.length.toString()]] : []),
        ],
    startY: currentY,
    theme: 'grid',
    margin: { left: contentLeft, right: shellX + 28 },
    styles: {
      fontSize: 10,
      textColor: inkColor,
      lineColor: borderColor,
      lineWidth: 1,
      cellPadding: 8,
    },
    columnStyles: {
      0: {
        fillColor: softAccent,
        fontStyle: 'bold',
        cellWidth: 120,
      },
      1: {
        textColor: primaryColor,
        fontStyle: 'bold',
      },
    },
  });

  doc.setFontSize(10);
  doc.setTextColor(mutedColor);
  doc.text('Thank you for registering for the event.', pageWidth / 2, pageHeight - 52, { align: 'center' });
  doc.text('For any inquiries, please contact us at sahajogtelangana@gmail.com', pageWidth / 2, pageHeight - 36, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
