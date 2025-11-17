'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function MonthlyReport() {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleDownloadReport = async () => {
    setLoading(true);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await fetch(`/api/reports/monthly?month=${month}&year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneymatters-report-${year}-${String(month).padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Report</CardTitle>
        <CardDescription>Generate and download your monthly financial report as PDF</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownloadReport} disabled={loading} className="w-full">
          {loading ? 'Generating...' : 'Download Monthly Report (PDF)'}
        </Button>
      </CardContent>
    </Card>
  );
}
