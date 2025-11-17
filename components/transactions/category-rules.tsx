'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Rule {
  _id: string;
  keywords: string[];
  category: string;
  priority: number;
}

export function CategoryRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchRules();
  }, [token]);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/category-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/category-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keywords: keywords.split(',').map((k) => k.trim()),
          category,
        }),
      });

      if (response.ok) {
        setKeywords('');
        setCategory('');
        await fetchRules();
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Categorization Rules</CardTitle>
        <CardDescription>Set keywords for automatic category detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddRule} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords (comma-separated)</label>
            <Input
              placeholder="starbucks, coffee, cafe"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Select category</option>
              <option value="groceries">Groceries</option>
              <option value="dining">Dining</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="fitness">Fitness</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Rule'}
          </Button>
        </form>

        <div className="mt-6 space-y-2">
          {rules.map((rule) => (
            <div key={rule._id} className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{rule.category}</p>
              <p className="text-sm text-muted-foreground">{rule.keywords.join(', ')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
