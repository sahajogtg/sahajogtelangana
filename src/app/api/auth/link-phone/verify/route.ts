import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { User } from '@/models/User';
import OtpSession from '@/models/OtpSession';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    user.phone = normalizedPhone;
    user.phoneVerified = true;
    await user.save();

    await OtpSession.deleteMany({ phone: normalizedPhone });

    return NextResponse.json({
      message: 'Phone number linked successfully',
      phone: normalizedPhone,
    });
  } catch (error: any) {
    console.error('Link phone verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
