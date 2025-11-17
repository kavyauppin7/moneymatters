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
    const transactions = await db.collection('transactions')
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
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

    const { amount, description, category, date, type } = await request.json();

    if (!amount || !description || !category || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('transactions').insertOne({
      userId: new ObjectId(decoded.userId),
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date),
      type, // 'income' or 'expense'
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const transaction = await db.collection('transactions').findOne({ _id: result.insertedId });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}