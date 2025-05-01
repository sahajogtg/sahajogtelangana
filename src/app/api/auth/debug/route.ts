import { NextResponse } from 'next/server';
import { connect } from '@/database/mongo.config';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Connect to MongoDB
    connect();
    
    // Get a sample user (just for debugging, never do this in production)
    const user = await User.findOne({});
    
    if (!user) {
      return NextResponse.json({ message: 'No users found', error: null });
    }
    
    // Return user info (omit password)
    return NextResponse.json({
      message: 'Debug data',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ message: 'Error', error: String(error) }, { status: 500 });
  }
} 