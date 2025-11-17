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

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12');

    const db = await getDatabase();
    
    // Calculate date range for the last N months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await db.collection('transactions')
      .find({
        userId: new ObjectId(decoded.userId),
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: 1 })
      .toArray();

    // Group transactions by month
    const monthlyData = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: monthDate.toISOString().slice(0, 7), // YYYY-MM format
        monthName: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses,
        transactionCount: monthTransactions.length
      });
    }

    return NextResponse.json(monthlyData.map(item => ({
      month: item.monthName,
      income: item.income,
      expense: item.expenses
    })));
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly trend' }, { status: 500 });
  }
}