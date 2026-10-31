// TransactionsScreen.js — Full transaction list with search, filter, add
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Card, AmountText, EmptyState, Button, StatusPill } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import moment from 'moment';

const CATEGORIES = ['All', 'Food & Dining', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Salary', 'Freelance', 'Bills', 'Other'];
const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Shopping': '🛍️', 'Entertainment': '🎬',
  'Transport': '🚗', 'Health': '💊', 'Salary': '💼', 'Freelance': '💻',
  'Bills': '🧾', 'Other': '📦', 'Investment': '📈',
};

export default function TransactionsScreen({ navigation }) {
  const { transactions, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('all'); // all | income | expense
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'All' || t.category === filterCategory;
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchCat && matchType;
    });
  }, [transactions, search, filterCategory, filterType]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      const key = moment(t.date).format('MMMM D, YYYY');
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).sort((a, b) => moment(b[0], 'MMMM D, YYYY') - moment(a[0], 'MMMM D, YYYY'));
  }, [filtered]);

  const handleDelete = (item) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(item.id) },
    ]);
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.txRow}
      onPress={() => navigation.navigate('AddTransaction', { editItem: item })}
      onLongPress={() => handleDelete(item)}>
      <View style={[styles.txIcon, { backgroundColor: item.type === 'income' ? '#D1FAE5' : '#FEE2E2' }]}>
        <Text style={{ fontSize: 22 }}>{CATEGORY_ICONS[item.category] || '📦'}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
          <Text style={styles.txCat}>{item.category}</Text>
          {item.location && <Text style={styles.txLocation}>📍 {item.location.name || 'Location'}</Text>}
        </View>
        <Text style={styles.txTime}>{moment(item.date).fromNow()}</Text>
      </View>
      <AmountText amount={item.amount} type={item.type} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterBtn}>
          <Text style={{ fontSize: 16 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.typeTabs}>
        {['all', 'income', 'expense'].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilterType(type)}
            style={[styles.typeTab, filterType === type && styles.typeTabActive]}>
            <Text style={[styles.typeTabText, filterType === type && styles.typeTabTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <EmptyState icon="📋" title="No transactions" subtitle="Add a transaction using the + button" />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={([date]) => date}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: [date, items] }) => (
            <View style={{ marginBottom: Spacing.sm }}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.dateSummary}>
                  {items.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0) >= 0 ? '+' : ''}
                  ${Math.abs(items.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)).toFixed(2)}
                </Text>
              </View>
              <Card style={{ padding: 0 }}>
                {items.map((item, idx) => (
                  <View key={item.id}>
                    {renderTransaction({ item })}
                    {idx < items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </Card>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 100 }}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent onRequestClose={() => setShowFilter(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>

            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  style={[styles.catChip, filterCategory === cat && styles.catChipActive]}>
                  <Text style={[styles.catChipText, filterCategory === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button title="Apply Filter" onPress={() => setShowFilter(false)} />
            <Button title="Reset" variant="outline" style={{ marginTop: 8 }} onPress={() => { setFilterCategory('All'); setFilterType('all'); setShowFilter(false); }} />
          </View>
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: Spacing.md, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, padding: 10, fontSize: 14, color: Colors.textPrimary },
  filterBtn: { padding: 8 },
  typeTabs: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: 4,
  },
  typeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  typeTabActive: { backgroundColor: Colors.primary },
  typeTabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  typeTabTextActive: { color: '#fff' },
  dateHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6, paddingHorizontal: 2,
  },
  dateText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  dateSummary: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.sm,
  },
  txIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  txCat: { fontSize: 11, color: Colors.textMuted },
  txLocation: { fontSize: 11, color: Colors.primary },
  txTime: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  filterLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight, marginRight: 8, borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
});
