import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDatabase } from '../db/mongodb';
import { generateToken } from '../middleware/auth';
import { ObjectId } from 'mongodb';

export async function handleSignUp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDatabase();
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
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
    return res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
}

export async function handleSignIn(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Signin failed' });
  }
}

export async function handleGoogleAuth(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Google auth failed' });
  }
}
