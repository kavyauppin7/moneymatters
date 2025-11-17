import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/api/db/mongodb';
import { generateToken } from '@/api/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      email,
      name,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        currency: 'USD',
        timezone: 'UTC',
        theme: 'dark',
      },
    });

    const token = generateToken(result.insertedId.toString());
    return NextResponse.json({
      token,
      user: {
        id: result.insertedId,
        email,
        name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}