import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';
import { AuthenticatedRequest } from '../middleware/auth';

export async function handleGetBudgets(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const userId = new ObjectId(req.userId);

    const budgets = await db
      .collection('budgets')
      .find({
        $or: [{ ownerId: userId }, { 'members.userId': userId }],
      })
      .toArray();

    return res.status(200).json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    return res.status(500).json({ error: 'Failed to fetch budgets' });
  }
}

export async function handleCreateBudget(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, totalBudget, period, categories } = req.body;
    const userId = new ObjectId(req.userId);
    const db = await getDatabase();

    const budget = {
      name,
      description,
      ownerId: userId,
      members: [{ userId, role: 'owner' as const, joinedAt: new Date() }],
      categories: categories || [],
      totalBudget: parseFloat(totalBudget),
      period,
      startDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('budgets').insertOne(budget);

    return res.status(201).json({
      id: result.insertedId,
      ...budget,
    });
  } catch (error) {
    console.error('Create budget error:', error);
    return res.status(500).json({ error: 'Failed to create budget' });
  }
}

export async function handleInviteToBudget(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { budgetId, email, role } = req.body;
    const db = await getDatabase();

    const userToInvite = await db.collection('users').findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(budgetId as string) },
      {
        $push: {
          members: {
            userId: userToInvite._id,
            role: role || 'member',
            joinedAt: new Date(),
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Invite to budget error:', error);
    return res.status(500).json({ error: 'Failed to invite user' });
  }
}
