// src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { User } from '@/models/User'; // Adjust this import path as necessary
import { connect } from "@/database/mongo.config";

export async function GET() {
  try {
    connect();
    const users = await User.find({}, 'name role');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}