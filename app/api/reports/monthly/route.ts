import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/api/db/mongodb';
import { verifyToken } from '@/api/middleware/auth';
import { ObjectId } from 'mongodb';
import { pdf } from '@react-pdf/renderer';
import { MonthlyReportDocument } from '@/lib/pdf-generator';


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
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const db = await getDatabase();
    
    // Get user info
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get transactions for the month
    const transactions = await db.collection('transactions')
      .find({
        userId: new ObjectId(decoded.userId),
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: -1 })
      .toArray();

    // Calculate summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown for expenses
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Calculate daily spending
    const dailySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        acc[dateKey] = (acc[dateKey] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const dailySpendingArray = Object.entries(dailySpending)
      .map(([date, amount]) => ({ 
        date: new Date(date).toLocaleDateString(), 
        amount 
      }))
      .sort((a, b) => b.amount - a.amount);

    const reportData = {
      user: user.name,
      month,
      year,
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        transactionCount: transactions.length
      },
      transactions: transactions.map(t => ({
        date: t.date,
        description: t.description,
        category: t.category || 'uncategorized',
        amount: t.amount,
        type: t.type
      })),
      categoryBreakdown,
      dailySpending: dailySpendingArray
    };

    // Generate PDF
    const pdfBuffer = await pdf(MonthlyReportDocument({ data: reportData })).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="moneymatters-report-${year}-${String(month).padStart(2, '0')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}