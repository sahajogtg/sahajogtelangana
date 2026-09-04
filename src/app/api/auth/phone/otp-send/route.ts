import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import OtpSession from '@/models/OtpSession';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phone: string, otp: string): Promise<boolean> {
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

  if (!msg91AuthKey || !msg91TemplateId) {
    console.log(`[OTP DEV] Phone: ${phone}, OTP: ${otp}`);
    return true;
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'authkey': msg91AuthKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mobile: `91${phone}`,
        otp: otp,
        template_id: msg91TemplateId,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { phone } = await request.json();

    if (!phone || !/^[0-9+\-\s()]{8,15}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    const recentOtp = await OtpSession.findOne({
      phone: normalizedPhone,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - recentOtp.createdAt.getTime();
      if (timeSinceLastOtp < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSeconds} seconds before requesting another OTP` },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpSession.deleteMany({ phone: normalizedPhone, verified: false });

    await OtpSession.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    const smsSent = await sendSMS(normalizedPhone, otp);

    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      phone: normalizedPhone,
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
