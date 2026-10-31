// ProfileScreen.js — User profile, settings, wallet management, currency
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Alert, Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../context/AppContext';
import { firebaseSignOut } from '../services/firebase';
import { Card, Button, Input, EmptyState } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'JPY', 'INR', 'BDT'];
const WALLET_TYPES = ['cash', 'bank', 'credit', 'savings', 'crypto'];
const WALLET_COLORS = ['#7C3AED', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899'];

export default function ProfileScreen({ navigation }) {
  const { user, wallets, addWallet, updateWallet, deleteWallet, settings, updateSettings } = useApp();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [editWallet, setEditWallet] = useState(null);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('cash');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletColor, setWalletColor] = useState(WALLET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const openAddWallet = () => {
    setEditWallet(null);
    setWalletName(''); setWalletType('cash'); setWalletBalance('0'); setWalletColor(WALLET_COLORS[0]);
    setShowWalletModal(true);
  };

  const openEditWallet = (w) => {
    setEditWallet(w);
    setWalletName(w.name); setWalletType(w.type || 'cash');
    setWalletBalance(w.balance?.toString() || '0'); setWalletColor(w.color || WALLET_COLORS[0]);
    setShowWalletModal(true);
  };

  const handleSaveWallet = async () => {
    if (!walletName) return Alert.alert('Error', 'Wallet name is required');
    setLoading(true);
    try {
      const data = {
        name: walletName, type: walletType,
        balance: parseFloat(walletBalance) || 0, color: walletColor,
      };
      if (editWallet) await updateWallet(editWallet.id, data);
      else await addWallet(data);
      setShowWalletModal(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteWallet = (w) => {
    Alert.alert('Delete Wallet', `Delete "${w.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWallet(w.id) },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => firebaseSignOut() },
    ]);
  };

  const MenuRow = ({ icon, label, onPress, value, danger }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: Colors.expense }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient colors={['#5B21B6', '#7C3AED']} style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'FinSight User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Offline Mode'}</Text>
      </LinearGradient>

      {/* Wallets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Wallets</Text>
          <TouchableOpacity onPress={openAddWallet} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {wallets.map((w) => (
          <Card key={w.id} style={styles.walletCard}>
            <View style={[styles.walletDot, { backgroundColor: w.color || Colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.walletName}>{w.name}</Text>
              <Text style={styles.walletType}>{w.type}</Text>
            </View>
            <Text style={[styles.walletBalance, { color: w.balance < 0 ? Colors.expense : Colors.textPrimary }]}>
              ${Math.abs(w.balance).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => openEditWallet(w)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 16, color: Colors.textMuted }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteWallet(w)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      {/* Settings */}
      <Card style={styles.menuCard}>
        <Text style={styles.menuSection}>Settings</Text>
        <MenuRow
          icon="💵" label="Currency"
          value={settings?.currency || 'USD'}
          onPress={() => {
            const idx = CURRENCIES.indexOf(settings?.currency || 'USD');
            const next = CURRENCIES[(idx + 1) % CURRENCIES.length];
            updateSettings({ currency: next });
          }}
        />
        <View style={styles.separator} />
        <View style={styles.menuRow}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <Text style={styles.menuLabel}>Notifications</Text>
          <View style={{ flex: 1 }} />
          <Switch
            value={settings?.notifications ?? true}
            onValueChange={(v) => updateSettings({ notifications: v })}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <Card style={styles.menuCard}>
        <Text style={styles.menuSection}>Account</Text>
        <MenuRow icon="📊" label="Export Data" onPress={() => Alert.alert('Export', 'Data export coming soon!')} />
        <View style={styles.separator} />
        <MenuRow icon="🔒" label="Privacy & Security" onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')} />
        <View style={styles.separator} />
        <MenuRow icon="ℹ️" label="About FinSight" onPress={() => Alert.alert('FinSight', 'Smart Expense Tracker v1.0\nBy Sagor Chandra Sutra Dhar')} />
        <View style={styles.separator} />
        <MenuRow icon="🚪" label="Sign Out" onPress={handleSignOut} danger />
      </Card>

      <View style={{ height: 100 }} />

      {/* Wallet Modal */}
      <Modal visible={showWalletModal} animationType="slide" transparent onRequestClose={() => setShowWalletModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editWallet ? 'Edit Wallet' : 'Add Wallet'}</Text>
              <Input label="Wallet Name" value={walletName} onChangeText={setWalletName} placeholder="e.g. Cash" />
              <Input label="Balance ($)" value={walletBalance} onChangeText={setWalletBalance} placeholder="0.00" keyboardType="decimal-pad" />

              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.chipRow}>
                {WALLET_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setWalletType(t)}
                    style={[styles.chip, walletType === t && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
                    <Text style={[styles.chipText, walletType === t && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Color</Text>
              <View style={styles.chipRow}>
                {WALLET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setWalletColor(c)}
                    style={[styles.colorDot, { backgroundColor: c }, walletColor === c && styles.colorDotActive]}
                  />
                ))}
              </View>

              <Button title={editWallet ? 'Update Wallet' : 'Add Wallet'} onPress={handleSaveWallet} loading={loading} style={{ marginTop: Spacing.md }} />
              <Button title="Cancel" variant="outline" style={{ marginTop: 8 }} onPress={() => setShowWalletModal(false)} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  addBtn: {
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.full,
  },
  addBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  walletCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  walletDot: { width: 12, height: 12, borderRadius: 6 },
  walletName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  walletType: { fontSize: 11, color: Colors.textMuted, textTransform: 'capitalize' },
  walletBalance: { fontSize: 16, fontWeight: '800' },
  menuCard: { marginHorizontal: Spacing.md, marginTop: Spacing.md, padding: 0 },
  menuSection: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuValue: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 50,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.textPrimary },
});
