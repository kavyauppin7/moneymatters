'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const categoryColors: Record<string, string> = {
    groceries: 'bg-green-500/20 text-green-700 dark:text-green-400',
    dining: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    transportation: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    utilities: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
    entertainment: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
    salary: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>{transactions.length} transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryColors[tx.category] || 'bg-gray-500/20'}`}>
                      {tx.category}
                    </span>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold text-lg ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} ${tx.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tx._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
