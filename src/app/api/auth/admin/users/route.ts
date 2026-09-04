import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connect } from "@/database/mongo.config";
import { requireAdminSession } from '@/lib/auth';
import { normalizeRole } from '@/lib/roles';

export const dynamic = "force-dynamic";

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const users = await User.find({}, 'name email role').sort({ name: 1 });

    return NextResponse.json(users, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const userId = String(body.userId || '').trim();
    const role = normalizeRole(body.role);

    if (!userId || !role) {
      return NextResponse.json({ error: 'Valid userId and role are required' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).select('name email role').lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
