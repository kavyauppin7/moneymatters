'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold text-balance">
          Smart Expense
          <span className="text-primary"> Tracking</span>
        </h1>
        <p className="text-xl text-muted-foreground text-balance">
          Take control of your finances with automatic categorization, shared budgets, and detailed analytics.
        </p>

        <div className="flex gap-4 justify-center flex-wrap pt-8">
          <Button size="lg" onClick={() => router.push('/auth')}>
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <h3 className="font-semibold">Auto-Categorize</h3>
            <p className="text-sm text-muted-foreground">AI-powered categorization with custom rules</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📊</div>
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">Beautiful charts and detailed insights</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">👥</div>
            <h3 className="font-semibold">Shared Budgets</h3>
            <p className="text-sm text-muted-foreground">Collaborate with role-based access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
