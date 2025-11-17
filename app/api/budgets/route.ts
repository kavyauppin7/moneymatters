import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/api/db/mongodb';
import { verifyToken } from '@/api/middleware/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const budgets = await db.collection('budgets')
      .find({ 
        'members.userId': new ObjectId(decoded.userId) 
      })
      .toArray();

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, description, totalBudget, period } = await request.json();

    if (!name || !totalBudget || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('budgets').insertOne({
      name,
      description,
      totalBudget: parseFloat(totalBudget),
      period,
      members: [{ userId: new ObjectId(decoded.userId), role: 'owner' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const budget = await db.collection('budgets').findOne({ _id: result.insertedId });
    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}