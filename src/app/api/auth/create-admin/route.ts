import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    // Get user data from request body
    const userData = await request.json();
    const { email, password, name = "Admin", role = "Admin" } = userData;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        status: 400,
        message: "Email and password are required"
      }, { status: 400 });
    }
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      return NextResponse.json({
        status: 400,
        message: "User with this email already exists"
      }, { status: 400 });
    }
    
    // Create a new admin user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    return NextResponse.json({
      status: 200,
      message: `Admin created successfully with email: ${email}`
    }, { status: 200 });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({
      status: 500,
      message: "Error creating admin user",
      error
    }, { status: 500 });
  }
} 