import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    width: '23%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  incomeValue: {
    color: '#059669',
  },
  expenseValue: {
    color: '#dc2626',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 9,
    color: '#1f2937',
  },
  categoryList: {
    marginVertical: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 3,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 10,
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  insightsBox: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#2563eb',
    marginVertical: 10,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// PDF Document Component
export const MonthlyReportDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MoneyMatters - Monthly Report</Text>
        <Text style={styles.subtitle}>
          {data.user} • {new Date(data.year, data.month - 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              {formatCurrency(data.summary.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              {formatCurrency(data.summary.totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Income</Text>
            <Text style={[
              styles.summaryValue, 
              data.summary.netIncome >= 0 ? styles.incomeValue : styles.expenseValue
            ]}>
              {formatCurrency(data.summary.netIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>
              {data.summary.transactionCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {Object.keys(data.categoryBreakdown).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoryList}>
            {Object.entries(data.categoryBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([category, amount], index) => {
                const percentage = ((amount as number) / data.summary.totalExpenses) * 100;
                return (
                  <View key={index} style={styles.categoryItem}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={styles.categoryName}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                        <Text style={styles.categoryAmount}>
                          {formatCurrency(amount as number)} ({percentage.toFixed(1)}%)
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* Financial Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Insights</Text>
        <View style={styles.insightsBox}>
          <Text style={styles.insightTitle}>Monthly Performance</Text>
          <Text style={styles.insightText}>
            {data.summary.netIncome >= 0 
              ? `Great job! You saved ${formatCurrency(data.summary.netIncome)} this month. Your income exceeded expenses by ${((data.summary.netIncome / data.summary.totalIncome) * 100).toFixed(1)}%.`
              : `You spent ${formatCurrency(Math.abs(data.summary.netIncome))} more than you earned this month. Consider reviewing your expenses to improve your financial health.`
            }
          </Text>
        </View>
        
        {Object.keys(data.categoryBreakdown).length > 0 && (
          <View style={styles.insightsBox}>
            <Text style={styles.insightTitle}>Top Spending Category</Text>
            <Text style={styles.insightText}>
              Your highest expense category was "{Object.entries(data.categoryBreakdown)
                .sort(([,a], [,b]) => (b as number) - (a as number))[0][0]}" 
              with {formatCurrency(Object.entries(data.categoryBreakdown)
                .sort(([,a], [,b]) => (b as number) - (a as number))[0][1] as number)}, 
              representing {((Object.entries(data.categoryBreakdown)
                .sort(([,a], [,b]) => (b as number) - (a as number))[0][1] as number / data.summary.totalExpenses) * 100).toFixed(1)}% of total expenses.
            </Text>
          </View>
        )}
      </View>

      {/* Transactions Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Category</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Type</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Amount</Text>
            </View>
          </View>
          
          {/* Rows */}
          {data.transactions.slice(0, 15).map((tx: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {new Date(tx.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {tx.description.length > 15 ? tx.description.substring(0, 15) + '...' : tx.description}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{tx.category}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{tx.type}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={[
                  styles.tableCell,
                  tx.type === 'income' ? styles.incomeValue : styles.expenseValue
                ]}>
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        {data.transactions.length > 15 && (
          <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 10 }}>
            Showing first 15 transactions of {data.transactions.length} total
          </Text>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} • MoneyMatters Financial Report
      </Text>
    </Page>
  </Document>
);