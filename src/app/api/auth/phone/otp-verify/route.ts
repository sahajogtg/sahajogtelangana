import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import OtpSession from '@/models/OtpSession';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    const otpSession = await OtpSession.findOne({
      phone: normalizedPhone,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpSession) {
      return NextResponse.json(
        { error: 'No active OTP session found. Please request a new OTP.' },
        { status: 404 }
      );
    }

    if (otpSession.expiresAt < new Date()) {
      await OtpSession.deleteOne({ _id: otpSession._id });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    if (otpSession.attempts >= 3) {
      await OtpSession.deleteOne({ _id: otpSession._id });
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new OTP.' },
        { status: 429 }
      );
    }

    if (otpSession.otp !== otp.trim()) {
      otpSession.attempts += 1;
      await otpSession.save();
      return NextResponse.json(
        { error: `Invalid OTP. ${3 - otpSession.attempts} attempts remaining.` },
        { status: 401 }
      );
    }

    otpSession.verified = true;
    await otpSession.save();

    return NextResponse.json({
      message: 'OTP verified successfully',
      phone: normalizedPhone,
      verified: true,
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
