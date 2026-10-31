// AddTransactionScreen.js — Add or edit a transaction
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const CATEGORIES = {
  expense: [
    { label: 'Food & Dining', icon: '🍔' },
    { label: 'Shopping', icon: '🛍️' },
    { label: 'Transport', icon: '🚗' },
    { label: 'Entertainment', icon: '🎬' },
    { label: 'Health', icon: '💊' },
    { label: 'Bills', icon: '🧾' },
    { label: 'Other', icon: '📦' },
  ],
  income: [
    { label: 'Salary', icon: '💼' },
    { label: 'Freelance', icon: '💻' },
    { label: 'Investment', icon: '📈' },
    { label: 'Gift', icon: '🎁' },
    { label: 'Other', icon: '📦' },
  ],
};

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction, updateTransaction, wallets } = useApp();
  const editItem = route.params?.editItem;
  const defaultType = route.params?.type || 'expense';

  const [type, setType] = useState(editItem?.type || defaultType);
  const [amount, setAmount] = useState(editItem?.amount?.toString() || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [category, setCategory] = useState(editItem?.category || '');
  const [walletId, setWalletId] = useState(editItem?.walletId || wallets[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(editItem?.note || '');

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) return Alert.alert('Error', 'Enter a valid amount');
    if (!description) return Alert.alert('Error', 'Enter a description');
    if (!category) return Alert.alert('Error', 'Select a category');
    if (!walletId) return Alert.alert('Error', 'Select a wallet');

    setLoading(true);
    try {
      const data = {
        type,
        amount: parseFloat(amount),
        description,
        category,
        walletId,
        note,
        date: new Date().toISOString(),
      };
      if (editItem) {
        await updateTransaction(editItem.id, data);
      } else {
        await addTransaction(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const cats = CATEGORIES[type];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editItem ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          {['expense', 'income'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => { setType(t); setCategory(''); }}
              style={[styles.typeBtn, type === t && (t === 'expense' ? styles.typeBtnExpense : styles.typeBtnIncome)]}>
              <Text style={[styles.typeBtnText, type === t && { color: '#fff' }]}>
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: type === 'expense' ? Colors.expense : Colors.income }]}>$</Text>
            <Input
              inputStyle={[styles.amountInput, { color: type === 'expense' ? Colors.expense : Colors.income }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <Input label="Description" value={description} onChangeText={setDescription} placeholder="What was this for?" />
          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="Additional details..." />

          {/* Wallet Selector */}
          <Text style={styles.fieldLabel}>Wallet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => setWalletId(w.id)}
                style={[styles.chip, walletId === w.id && { backgroundColor: w.color || Colors.primary, borderColor: 'transparent' }]}>
                <Text style={[styles.chipText, walletId === w.id && { color: '#fff' }]}>{w.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Category Grid */}
        <Card style={styles.section}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.catGrid}>
            {cats.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                onPress={() => setCategory(cat.label)}
                style={[styles.catItem, category === cat.label && styles.catItemActive]}>
                <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                <Text style={[styles.catLabel, category === cat.label && { color: Colors.primary }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title={editItem ? 'Update Transaction' : 'Save Transaction'}
          onPress={handleSave}
          loading={loading}
          style={{ marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  typeToggle: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: 4,
  },
  typeBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.sm,
  },
  typeBtnExpense: { backgroundColor: Colors.expense },
  typeBtnIncome: { backgroundColor: Colors.income },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  amountCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, alignItems: 'center' },
  amountLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 36, fontWeight: '800', marginRight: 4 },
  amountInput: {
    fontSize: 48, fontWeight: '800', borderWidth: 0, backgroundColor: 'transparent', minWidth: 160,
  },
  section: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  catItem: {
    width: '30%', alignItems: 'center', padding: 10,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.borderLight,
  },
  catItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  catLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
