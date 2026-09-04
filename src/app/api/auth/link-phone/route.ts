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

    const { phone } = await request.json();

    if (!phone || !/^[0-9+\-\s()]{8,15}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    const existingUserWithPhone = await User.findOne({
      phone: normalizedPhone,
      email: { $ne: session.user.email },
    });

    if (existingUserWithPhone) {
      return NextResponse.json(
        { error: 'This phone number is already linked to another account' },
        { status: 409 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpSession.deleteMany({ phone: normalizedPhone, verified: false });

    await OtpSession.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

    if (msg91AuthKey && msg91TemplateId) {
      await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': msg91AuthKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          mobile: `91${normalizedPhone}`,
          otp: otp,
          template_id: msg91TemplateId,
        }),
      });
    } else {
      console.log(`[LINK PHONE DEV] Phone: ${normalizedPhone}, OTP: ${otp}`);
    }

    return NextResponse.json({
      message: 'OTP sent to your phone for verification',
      phone: normalizedPhone,
    });
  } catch (error: any) {
    console.error('Link phone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
