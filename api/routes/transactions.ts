import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';
import { categorizeTransaction } from '../utils/categorizer';
import { AuthenticatedRequest } from '../middleware/auth';

export async function handleGetTransactions(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const userId = new ObjectId(req.userId);
    const { month, year, category } = req.query;

    let query: any = { userId };

    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (category) {
      query.category = category;
    }

    const transactions = await db
      .collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

export async function handleCreateTransaction(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, description, type, date, isRecurring, recurringPattern } = req.body;

    if (!amount || !description || !type || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = new ObjectId(req.userId);
    const db = await getDatabase();

    // Auto-categorize transaction
    const category = await categorizeTransaction(description, userId);

    const transactionData = {
      userId,
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date(date),
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transactionData);

    return res.status(201).json({
      id: result.insertedId,
      ...transactionData,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
}

export async function handleUpdateTransaction(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { amount, description, type, date, category } = req.body;

    const db = await getDatabase();
    const userId = new ObjectId(req.userId);

    const result = await db.collection('transactions').updateOne(
      { _id: new ObjectId(id as string), userId },
      {
        $set: {
          amount: amount ? parseFloat(amount) : undefined,
          description,
          type,
          date: date ? new Date(date) : undefined,
          category,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update transaction error:', error);
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
}

export async function handleDeleteTransaction(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const db = await getDatabase();
    const userId = new ObjectId(req.userId);

    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(id as string),
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
}
