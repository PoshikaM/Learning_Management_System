import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name || !role) {
      console.log(' Registration failed: Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(role)) {
      console.log(' Registration failed: Invalid role -', role);
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(' Registration failed: Invalid email format -', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log(' Registration failed: Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Log registration attempt
    console.log(' New user registration attempt:', {
      email,
      name,
      role,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Connect to MongoDB
    console.log(' Connecting to MongoDB...');
    const db = await connectToDatabase();
    console.log(' Connected to MongoDB:', db.connection.name);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(' Registration failed: Email already exists -', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    console.log(' User registration successful:', {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(' Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}