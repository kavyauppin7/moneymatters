'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export function BudgetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          totalBudget,
          period,
          categories: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      setName('');
      setTotalBudget('');
      setPeriod('monthly');
      setDescription('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Budget</CardTitle>
        <CardDescription>Set up a new budget for tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Budget Name
            </label>
            <Input
              id="name"
              placeholder="Family Budget"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="description"
              placeholder="Track household expenses"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="total" className="text-sm font-medium">
                Total Budget
              </label>
              <Input
                id="total"
                type="number"
                placeholder="5000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="period" className="text-sm font-medium">
                Period
              </label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
