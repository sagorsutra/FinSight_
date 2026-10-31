// HomeScreen.js — Dashboard: balance card, income/expense summary, recent transactions
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, AmountText, EmptyState, GradientCard } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Shopping': '🛍️', 'Entertainment': '🎬',
  'Transport': '🚗', 'Health': '💊', 'Salary': '💼', 'Freelance': '💻',
  'Investment': '📈', 'Bills': '🧾', 'Other': '📦',
};

export default function HomeScreen({ navigation }) {
  const { totalBalance, totalIncome, totalExpense, recentTransactions, wallets, user, settings } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const currency = settings?.currency === 'USD' ? '$' : settings?.currency === 'GBP' ? '£' : '€';

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.txRow}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
      <View style={[styles.txIcon, { backgroundColor: item.type === 'income' ? '#D1FAE5' : '#FEE2E2' }]}>
        <Text style={{ fontSize: 20 }}>{CATEGORY_ICONS[item.category] || '📦'}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.txCat}>{item.category}</Text>
      </View>
      <AmountText amount={item.amount} type={item.type} size="sm" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.displayName || 'U')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <GradientCard colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{currency}{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>

        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeBox}>
            <Text style={styles.ieLabel}>↑ Income</Text>
            <Text style={styles.ieAmount}>{currency}{totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.expenseBox}>
            <Text style={styles.ieLabel}>↓ Expenses</Text>
            <Text style={[styles.ieAmount, { color: '#FCA5A5' }]}>{currency}{totalExpense.toFixed(2)}</Text>
          </View>
        </View>
      </GradientCard>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { label: 'Add\nExpense', icon: '➕', color: Colors.accentRed, screen: 'AddTransaction', params: { type: 'expense' } },
          { label: 'Add\nIncome', icon: '💰', color: Colors.income, screen: 'AddTransaction', params: { type: 'income' } },
          { label: 'View\nInsights', icon: '📊', color: Colors.primary, screen: 'Insights' },
          { label: 'My\nWallets', icon: '👛', color: Colors.accent, screen: 'Wallets' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickBtn}
            onPress={() => navigation.navigate(action.screen, action.params)}>
            <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}>
              <Text style={{ fontSize: 22 }}>{action.icon}</Text>
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Wallets Horizontal Scroll */}
      <SectionHeader title="My Wallets" action="See All" onAction={() => navigation.navigate('Wallets')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.md }}>
        <View style={styles.walletsRow}>
          {wallets.map((w) => (
            <Card key={w.id} style={[styles.walletCard, { borderLeftColor: w.color || Colors.primary }]}>
              <Text style={styles.walletName}>{w.name}</Text>
              <Text style={styles.walletType}>{w.type}</Text>
              <Text style={[styles.walletBalance, { color: w.balance < 0 ? Colors.expense : Colors.textPrimary }]}>
                {currency}{Math.abs(w.balance).toFixed(2)}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* AI Suggestions Banner */}
      <TouchableOpacity onPress={() => navigation.navigate('Insights')} style={styles.aiBanner}>
        <LinearGradient colors={['#F59E0B', '#EF4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aiBannerGradient}>
          <Text style={styles.aiBannerText}>🤖 AI Insights & Suggestions →</Text>
          <Text style={styles.aiBannerSub}>Analyze your spending patterns</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Recent Transactions */}
      <SectionHeader title="Recent Transactions" action="See All" onAction={() => navigation.navigate('Transactions')} />

      {recentTransactions.length === 0 ? (
        <EmptyState icon="📋" title="No transactions yet" subtitle="Add your first transaction to get started" />
      ) : (
        <Card style={{ padding: 0 }}>
          {recentTransactions.slice(0, 5).map((item, idx) => (
            <View key={item.id}>
              {renderTransaction({ item })}
              {idx < recentTransactions.length - 1 && idx < 4 && (
                <View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md }} />
              )}
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subGreeting: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  avatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  balanceCard: { marginBottom: Spacing.md },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: Spacing.md },
  incomeExpenseRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  incomeBox: { flex: 1, alignItems: 'center' },
  expenseBox: { flex: 1, alignItems: 'center' },
  vDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  ieLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 4 },
  ieAmount: { color: '#fff', fontSize: 16, fontWeight: '700' },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  quickBtn: { alignItems: 'center', flex: 1 },
  quickIcon: {
    width: 52, height: 52,
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  walletsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  walletCard: {
    width: 140,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  walletName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  walletType: { fontSize: 11, color: Colors.textMuted, textTransform: 'capitalize', marginBottom: 8 },
  walletBalance: { fontSize: 18, fontWeight: '800' },
  aiBanner: { marginBottom: Spacing.sm },
  aiBannerGradient: { borderRadius: BorderRadius.md, padding: Spacing.md },
  aiBannerText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  aiBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  txIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  txCat: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
