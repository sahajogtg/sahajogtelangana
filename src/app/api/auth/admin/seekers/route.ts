import { NextRequest, NextResponse } from 'next/server';
import { Seeker } from '@/models/Seeker';
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from '@/lib/auth';

export const dynamic = "force-dynamic";

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    connect();
    const { searchParams } = request.nextUrl;
    const query: Record<string, any> = {};
    const city = searchParams.get('city');
    const followUpStatus = searchParams.get('followUpStatus');
    const assignedVolunteer = searchParams.get('assignedVolunteer');

    if (city) {
      query.city = city;
    }

    if (followUpStatus) {
      query.followUpStatus = followUpStatus;
    }

    if (assignedVolunteer) {
      query.assignedVolunteer = assignedVolunteer;
    }

    const seekers = await Seeker.find(query).sort({ addedAt: -1 });
    return NextResponse.json(seekers, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch seekers:', error);
    return NextResponse.json({ error: 'Failed to fetch seekers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    connect();
    const body = await request.json();
    const seekerId = String(body.seekerId || '').trim();

    if (!seekerId) {
      return NextResponse.json({ error: 'Seeker ID is required' }, { status: 400 });
    }

    const update = {
      followUpStatus: body.followUpStatus || 'New',
      assignedVolunteer: body.assignedVolunteer || '',
      lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : undefined,
      source: body.source || 'Website',
      eventInterest: body.eventInterest || '',
      centerInterest: body.centerInterest || '',
      preferredLanguage: body.preferredLanguage || 'English',
      notes: body.notes || '',
    };

    const seeker = await Seeker.findByIdAndUpdate(seekerId, { $set: update }, { new: true });
    if (!seeker) {
      return NextResponse.json({ error: 'Seeker not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Seeker updated successfully', data: seeker }, { status: 200 });
  } catch (error) {
    console.error('Failed to update seeker:', error);
    return NextResponse.json({ error: 'Failed to update seeker' }, { status: 500 });
  }
}
