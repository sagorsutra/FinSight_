// InsightsScreen.js — Charts, stats, AI suggestions
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, GradientCard } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import moment from 'moment';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 2 - 32;

const RANGE_OPTIONS = ['Week', 'Month', 'Year'];
const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Shopping': '🛍️', 'Entertainment': '🎬',
  'Transport': '🚗', 'Health': '💊', 'Salary': '💼', 'Freelance': '💻',
  'Bills': '🧾', 'Other': '📦',
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primary },
  propsForLabels: { fontSize: 11 },
};

const AI_TIPS = [
  { icon: '💡', title: 'Reduce dining out', desc: 'You spend 35% more on Food & Dining than the recommended budget.' },
  { icon: '📉', title: 'High subscription costs', desc: 'Your Entertainment subscriptions totaled $150 this month.' },
  { icon: '💰', title: 'Savings opportunity', desc: 'You could save $200/month by cutting impulse shopping by 20%.' },
  { icon: '📅', title: 'Upcoming bills', desc: 'You have 3 bills due in the next 7 days totaling $450.' },
];

export default function InsightsScreen() {
  const { transactions, totalIncome, totalExpense } = useApp();
  const [range, setRange] = useState('Month');

  const rangeTransactions = useMemo(() => {
    const now = moment();
    return transactions.filter((t) => {
      const date = moment(t.date);
      if (range === 'Week') return date.isAfter(now.clone().subtract(7, 'days'));
      if (range === 'Month') return date.isAfter(now.clone().subtract(30, 'days'));
      return date.isAfter(now.clone().subtract(365, 'days'));
    });
  }, [transactions, range]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const expenses = rangeTransactions.filter((t) => t.type === 'expense');
    const cats = {};
    expenses.forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6'];
    return Object.entries(cats).map(([name, population], i) => ({
      name: name.split(' ')[0],
      population: Math.round(population),
      color: COLORS[i % COLORS.length],
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    }));
  }, [rangeTransactions]);

  // Daily spending for line chart
  const lineData = useMemo(() => {
    const days = range === 'Week' ? 7 : range === 'Month' ? 6 : 12;
    const unit = range === 'Year' ? 'month' : 'week';
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = days - 1; i >= 0; i--) {
      const start = moment().subtract(i, unit === 'month' ? 'months' : 'weeks').startOf(unit === 'month' ? 'month' : 'week');
      const end = start.clone().endOf(unit === 'month' ? 'month' : 'week');
      labels.push(range === 'Year' ? start.format('MMM') : start.format('D/M'));

      const periodTx = transactions.filter((t) => moment(t.date).isBetween(start, end, null, '[]'));
      incomeData.push(periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      expenseData.push(periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }

    return { labels, datasets: [{ data: expenseData, color: () => Colors.expense, strokeWidth: 2 }] };
  }, [transactions, range]);

  const rangeIncome = rangeTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const rangeExpense = rangeTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = rangeIncome > 0 ? Math.max(0, ((rangeIncome - rangeExpense) / rangeIncome) * 100).toFixed(1) : '0';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      {/* Range Selector */}
      <View style={styles.rangeTabs}>
        {RANGE_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            style={[styles.rangeTab, range === r && styles.rangeTabActive]}>
            <Text style={[styles.rangeTabText, range === r && styles.rangeTabTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <GradientCard colors={['#10B981', '#059669']} style={styles.statCard}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>${rangeIncome.toFixed(0)}</Text>
        </GradientCard>
        <GradientCard colors={['#EF4444', '#DC2626']} style={styles.statCard}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statValue}>${rangeExpense.toFixed(0)}</Text>
        </GradientCard>
        <GradientCard colors={['#7C3AED', '#5B21B6']} style={styles.statCard}>
          <Text style={styles.statLabel}>Savings %</Text>
          <Text style={styles.statValue}>{savingsRate}%</Text>
        </GradientCard>
      </View>

      {/* Spending Trend Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Spending Trend</Text>
        {lineData.labels.length > 0 && (
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12 }}
            withInnerLines={false}
          />
        )}
      </Card>

      {/* Category Pie Chart */}
      {categoryData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          <PieChart
            data={categoryData}
            width={CHART_WIDTH}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </Card>
      )}

      {/* Category Breakdown List */}
      <SectionHeader title="Category Breakdown" />
      <Card style={{ marginHorizontal: Spacing.md, padding: 0, marginBottom: Spacing.sm }}>
        {categoryData.map((cat, idx) => {
          const pct = rangeExpense > 0 ? ((cat.population / rangeExpense) * 100).toFixed(0) : 0;
          return (
            <View key={cat.name}>
              <View style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.catBarWrap}>
                  <View style={[styles.catBar, { width: `${pct}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catPct}>{pct}%</Text>
                <Text style={styles.catAmt}>${cat.population}</Text>
              </View>
              {idx < categoryData.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
        {categoryData.length === 0 && (
          <Text style={{ padding: Spacing.md, color: Colors.textMuted, textAlign: 'center' }}>No expense data for this period</Text>
        )}
      </Card>

      {/* AI Suggestions */}
      <SectionHeader title="🤖 AI Suggestions" />
      {AI_TIPS.map((tip, i) => (
        <Card key={i} style={styles.tipCard}>
          <View style={styles.tipRow}>
            <Text style={{ fontSize: 28 }}>{tip.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        </Card>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  rangeTabs: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: 4,
  },
  rangeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  rangeTabActive: { backgroundColor: Colors.primary },
  rangeTabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  rangeTabTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8, marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, padding: 12 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  chartCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  catRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 8,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, width: 72 },
  catBarWrap: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  catBar: { height: 6, borderRadius: 3 },
  catPct: { fontSize: 12, color: Colors.textMuted, width: 36, textAlign: 'right' },
  catAmt: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, width: 52, textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  tipCard: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  tipRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  tipTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  tipDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
