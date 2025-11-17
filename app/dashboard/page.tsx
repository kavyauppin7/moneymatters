'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { SummaryCards } from '@/components/analytics/summary-cards';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transactions/transaction-list';
import { BudgetList } from '@/components/budgets/budget-list';
import { MonthlyReport } from '@/components/reports/monthly-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">MoneyMatters</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <IncomeExpenseChart />
          <CategoryBreakdown />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <TransactionForm onSuccess={() => setRefresh(refresh + 1)} />
          </TabsContent>

          <TabsContent value="budgets" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Shared Budgets</h2>
                <BudgetList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <MonthlyReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
