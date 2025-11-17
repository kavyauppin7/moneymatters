import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';

export async function processRecurringTransactions() {
  const db = await getDatabase();
  const now = new Date();

  // Find all recurring transactions that should have a new instance created
  const recurringTransactions = await db
    .collection('transactions')
    .find({
      isRecurring: true,
      recurringEndDate: { $gt: now },
    })
    .toArray();

  for (const tx of recurringTransactions) {
    const lastInstance = await db
      .collection('transactions')
      .findOne(
        { parentTransactionId: tx._id },
        { sort: { date: -1 } }
      );

    const lastDate = lastInstance?.date || tx.date;
    let nextDate = new Date(lastDate);

    // Calculate next occurrence based on pattern
    switch (tx.recurringPattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    // Only create if next date is not in the future beyond a reasonable threshold
    if (nextDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      await db.collection('transactions').insertOne({
        userId: tx.userId,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        type: tx.type,
        date: nextDate,
        isRecurring: false,
        parentTransactionId: tx._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export async function createRecurringTransaction(
  userId: ObjectId,
  amount: number,
  description: string,
  category: string,
  type: 'income' | 'expense',
  date: Date,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly',
  endDate?: Date
) {
  const db = await getDatabase();

  const result = await db.collection('transactions').insertOne({
    userId,
    amount,
    description,
    category,
    type,
    date,
    isRecurring: true,
    recurringPattern: pattern,
    recurringEndDate: endDate || new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year default
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result;
}
