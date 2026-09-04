import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import OtpSession from '@/models/OtpSession';
import { User } from '@/models/User';
import { VolunteerProfile } from '@/models/VolunteerProfile';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { phone, name } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    const otpSession = await OtpSession.findOne({
      phone: normalizedPhone,
      verified: true,
    }).sort({ createdAt: -1 });

    if (!otpSession) {
      return NextResponse.json(
        { error: 'Phone not verified. Please complete OTP verification first.' },
        { status: 400 }
      );
    }

    if (otpSession.expiresAt < new Date()) {
      await OtpSession.deleteOne({ _id: otpSession._id });
      return NextResponse.json(
        { error: 'Verification session expired. Please verify OTP again.' },
        { status: 410 }
      );
    }

    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name is required for new users' },
          { status: 400 }
        );
      }

      const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      const email = `phone_${normalizedPhone}@sahajayogatelangana.org`;

      user = await User.create({
        email,
        name: name.trim(),
        phone: normalizedPhone,
        phoneVerified: true,
        password: tempPassword,
        role: 'Yogi',
        city: 'Hyderabad',
        language: 'English',
      });
    } else {
      user.phone = normalizedPhone;
      user.phoneVerified = true;
      await user.save();
    }

    let volunteerProfile = null;
    if (user.role === 'Volunteer' || user.role === 'Admin') {
      volunteerProfile = await VolunteerProfile.findOne({ email: user.email });
    }

    await OtpSession.deleteMany({ phone: normalizedPhone });

    const token = Buffer.from(
      JSON.stringify({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      })
    ).toString('base64');

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        language: user.language,
        isNewUser: false,
      },
      volunteerProfile: volunteerProfile ? {
        id: volunteerProfile._id.toString(),
        city: volunteerProfile.city,
        language: volunteerProfile.language,
        roles: volunteerProfile.roles,
        staffingFocus: volunteerProfile.staffingFocus,
        isActive: volunteerProfile.isActive,
      } : null,
    });
  } catch (error: any) {
    console.error('OTP login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
