import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/api/db/mongodb';
import { generateToken } from '@/api/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const { googleId, email, name } = await request.json();

    if (!googleId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    let user = await db.collection('users').findOne({ googleId });

    if (!user) {
      const existingEmail = await db.collection('users').findOne({ email });
      if (existingEmail) {
        // Link Google account to existing email
        await db.collection('users').updateOne({ email }, { $set: { googleId } });
        user = await db.collection('users').findOne({ email });
      } else {
        // Create new user
        const result = await db.collection('users').insertOne({
          email,
          name,
          googleId,
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            currency: 'USD',
            timezone: 'UTC',
            theme: 'dark',
          },
        });
        user = await db.collection('users').findOne({ _id: result.insertedId });
      }
    }

    const token = generateToken(user._id.toString());
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Google auth failed' }, { status: 500 });
  }
}