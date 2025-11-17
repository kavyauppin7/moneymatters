'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export function SummaryCards() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const fetchSummary = async () => {
    try {
      const now = new Date();
      const response = await fetch(
        `/api/analytics/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">Loading...</div>;

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-2xl font-bold text-red-600">${summary.totalExpense.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{summary.transactionCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
