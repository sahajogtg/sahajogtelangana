import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/database/mongo.config';
import { Seeker } from '@/models/Seeker';
import { inferGender } from '@/lib/gender-inference';

export const dynamic = 'force-dynamic';

const phonePattern = /^[0-9+\-\s()]{8,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength = 160) {
  return String(value || '').trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (clean(body.website)) {
      return NextResponse.json({ message: 'Registration received.' }, { status: 201 });
    }

    const name = clean(body.name, 80);
    const phone = clean(body.phone, 20);
    const city = clean(body.city, 80);
    const email = clean(body.email, 120).toLowerCase();
    const preferredLanguage = clean(body.preferredLanguage, 40) || 'English';
    const eventName = clean(body.eventName || body.eventInterest, 120);

    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = 'Please enter your full name.';
    }

    if (!phone || !phonePattern.test(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!city || city.length < 2) {
      errors.city = 'Please enter your city.';
    }

    if (email && !emailPattern.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    await connect();

    const seeker = await Seeker.create({
      name,
      phone,
      city,
      email,
      locality: '',
      preferredLanguage,
      centerInterest: '',
      eventInterest: eventName,
      gender: inferGender(name),
      notes: '',
      source: 'QR Self Registration',
      followUpStatus: 'New',
      addedBy: 'Self Registration',
      addedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Registration received.', data: { id: seeker._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to register seeker:', error);
    return NextResponse.json({ error: 'Unable to submit registration right now.' }, { status: 500 });
  }
}
