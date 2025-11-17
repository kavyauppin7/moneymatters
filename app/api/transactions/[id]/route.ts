import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/api/db/mongodb';
import { verifyToken } from '@/api/middleware/auth';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(decoded.userId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const { amount, description, category, date, type } = await request.json();

    const db = await getDatabase();
    const result = await db.collection('transactions').updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(decoded.userId)
      },
      {
        $set: {
          amount: parseFloat(amount),
          description,
          category,
          date: new Date(date),
          type,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}