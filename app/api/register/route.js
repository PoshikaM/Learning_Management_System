import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // TODO: Replace with MongoDB integration
    // Example MongoDB operations:
    // const db = await connectToDatabase();
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    // }
    // const hashedPassword = await bcrypt.hash(password, 12);
    // const newUser = await User.create({
    //   email,
    //   password: hashedPassword,
    //   name,
    //   role,
    //   createdAt: new Date(),
    //   isActive: true
    // });

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    // TODO: Add email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Add password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Log registration details
    console.log('New user registration attempt:', {
      email,
      name,
      role,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // TODO: Check if user already exists in MongoDB
    // For now, we'll simulate a successful registration
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // TODO: Hash password before storing
      name,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('User registration successful:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      timestamp: newUser.createdAt
    });

    // TODO: Save user to MongoDB
    // await newUser.save();

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
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