'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecurringTransaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  recurringPattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate: string;
}

export function RecurringList() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchRecurring();
  }, [token]);

  const fetchRecurring = async () => {
    try {
      const response = await fetch('/api/transactions?recurring=true', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRecurring(data.filter((t: any) => t.isRecurring));
    } catch (error) {
      console.error('Error fetching recurring:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Transactions</CardTitle>
        <CardDescription>Automatically processed on schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {recurring.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recurring transactions</p>
        ) : (
          <div className="space-y-3">
            {recurring.map((tx) => (
              <div key={tx._id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {tx.recurringPattern}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tx.category}
                    </Badge>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
