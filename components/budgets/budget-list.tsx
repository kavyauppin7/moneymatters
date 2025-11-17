'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Budget {
  _id: string;
  name: string;
  description?: string;
  totalBudget: number;
  period: 'monthly' | 'yearly';
  members: Array<{ userId: string; role: 'owner' | 'admin' | 'member' }>;
}

export function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchBudgets();
  }, [token]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (budgetId: string) => {
    if (!inviteEmail) return;

    try {
      const response = await fetch(`/api/budgets/${budgetId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          budgetId,
          email: inviteEmail,
          role: 'member',
        }),
      });

      if (response.ok) {
        setInviteEmail('');
        setSelectedBudget(null);
        await fetchBudgets();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading budgets...</div>;
  }

  return (
    <div className="space-y-6">
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">No budgets yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        budgets.map((budget) => (
          <Card key={budget._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{budget.name}</CardTitle>
                  {budget.description && <CardDescription>{budget.description}</CardDescription>}
                </div>
                <Badge variant="outline">{budget.period}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${budget.totalBudget.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">{budget.members.length} member(s)</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Members:</p>
                <div className="space-y-1">
                  {budget.members.map((member, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBudget === budget._id ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter email to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleInvite(budget._id)}>
                      Send Invite
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedBudget(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" onClick={() => setSelectedBudget(budget._id)}>
                  Invite Member
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
