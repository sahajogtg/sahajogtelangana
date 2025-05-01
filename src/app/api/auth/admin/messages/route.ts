// src/app/api/auth/admin/messages/route.ts

import { NextResponse } from 'next/server';
import { Contact } from '@/models/Contact'; // Adjust this import path as necessary
import { connect } from "@/database/mongo.config";

export async function GET() {
  try {
    connect();
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}