// BillsScreen.js — Bills & Planning with status, add/edit/delete
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert, Switch,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, EmptyState, StatusPill } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import moment from 'moment';

const BILL_CATEGORIES = ['Rent', 'Electricity', 'Water', 'Internet', 'Insurance', 'Subscription', 'Loan', 'Other'];
const REPEAT_OPTIONS = ['One-time', 'Weekly', 'Monthly', 'Yearly'];

const BillCard = ({ bill, onEdit, onDelete, onMarkPaid }) => (
  <Card style={styles.billCard}>
    <View style={styles.billHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.billName}>{bill.name}</Text>
        <Text style={styles.billCat}>{bill.category} · {bill.repeat || 'One-time'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={styles.billAmount}>${parseFloat(bill.amount).toFixed(2)}</Text>
        <StatusPill status={bill.status} />
      </View>
    </View>

    <View style={styles.billFooter}>
      <Text style={styles.billDue}>
        📅 Due: {moment(bill.dueDate).format('MMM D, YYYY')}
        {bill.reminder && '  🔔'}
      </Text>
      <View style={styles.billActions}>
        {bill.status !== 'paid' && (
          <TouchableOpacity onPress={() => onMarkPaid(bill)} style={styles.billAction}>
            <Text style={styles.billActionText}>✓ Pay</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onEdit(bill)} style={styles.billAction}>
          <Text style={styles.billActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(bill)} style={[styles.billAction, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.billActionText, { color: Colors.expense }]}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Card>
);

export default function BillsScreen({ navigation }) {
  const { bills, addBill, updateBill, deleteBill } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [repeat, setRepeat] = useState('Monthly');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const openAdd = () => {
    setEditBill(null);
    setName(''); setAmount(''); setCategory(''); setRepeat('Monthly');
    setDueDate(moment().add(1, 'month').format('YYYY-MM-DD')); setReminder(false);
    setShowModal(true);
  };

  const openEdit = (bill) => {
    setEditBill(bill);
    setName(bill.name); setAmount(bill.amount?.toString()); setCategory(bill.category || '');
    setRepeat(bill.repeat || 'Monthly'); setDueDate(bill.dueDate || ''); setReminder(bill.reminder || false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !amount) return Alert.alert('Error', 'Name and amount are required');
    setLoading(true);
    try {
      const data = { name, amount: parseFloat(amount), category, repeat, dueDate, reminder };
      const now = moment();
      const due = moment(dueDate);
      const status = due.isBefore(now, 'day') ? 'overdue' : 'upcoming';

      if (editBill) {
        await updateBill(editBill.id, { ...data, status });
      } else {
        await addBill({ ...data, status });
      }
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (bill) => {
    Alert.alert('Delete Bill', `Delete "${bill.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBill(bill.id) },
    ]);
  };

  const handleMarkPaid = (bill) => {
    Alert.alert('Mark as Paid', `Mark "${bill.name}" as paid?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => updateBill(bill.id, { status: 'paid' }) },
    ]);
  };

  const filtered = bills.filter((b) => activeFilter === 'all' || b.status === activeFilter);

  const totalUpcoming = bills.filter((b) => b.status === 'upcoming').reduce((s, b) => s + (b.amount || 0), 0);
  const totalOverdue = bills.filter((b) => b.status === 'overdue').reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bills & Planning</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { borderLeftColor: Colors.upcoming }]}>
          <Text style={styles.summaryLabel}>Upcoming</Text>
          <Text style={styles.summaryAmount}>${totalUpcoming.toFixed(2)}</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftColor: Colors.overdue }]}>
          <Text style={styles.summaryLabel}>Overdue</Text>
          <Text style={[styles.summaryAmount, { color: Colors.overdue }]}>${totalOverdue.toFixed(2)}</Text>
        </Card>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {['all', 'upcoming', 'overdue', 'paid'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.tab, activeFilter === f && styles.tabActive]}>
            <Text style={[styles.tabText, activeFilter === f && styles.tabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="🧾" title="No bills" subtitle="Add a bill to track your upcoming payments" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BillCard bill={item} onEdit={openEdit} onDelete={handleDelete} onMarkPaid={handleMarkPaid} />
          )}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editBill ? 'Edit Bill' : 'Add Bill'}</Text>

              <Input label="Bill Name" value={name} onChangeText={setName} placeholder="e.g. Netflix" />
              <Input label="Amount ($)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
              <Input label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder={moment().format('YYYY-MM-DD')} />

              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {BILL_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, category === c && styles.chipActive]}>
                    <Text style={[styles.chipText, category === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.repeatRow}>
                {REPEAT_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRepeat(r)}
                    style={[styles.repeatChip, repeat === r && styles.chipActive]}>
                    <Text style={[styles.chipText, repeat === r && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.reminderRow}>
                <Text style={styles.fieldLabel}>Reminder</Text>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              <Button title={editBill ? 'Update Bill' : 'Add Bill'} onPress={handleSave} loading={loading} />
              <Button title="Cancel" variant="outline" style={{ marginTop: 8 }} onPress={() => setShowModal(false)} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '400', lineHeight: 28 },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  summaryCard: { flex: 1, borderLeftWidth: 4 },
  summaryLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  summaryAmount: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  billCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  billHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  billName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  billCat: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  billAmount: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  billFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billDue: { fontSize: 12, color: Colors.textMuted },
  billActions: { flexDirection: 'row', gap: 6 },
  billAction: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.borderLight,
  },
  billActionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 50,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  repeatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  repeatChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
});
