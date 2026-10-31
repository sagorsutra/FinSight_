// AppContext.js — Global state: auth, wallets, transactions, bills
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveLocal, loadLocal, KEYS } from '../services/storage';
import { onAuthChange, fsGetCollection, fsListen, where, orderBy } from '../services/firebase';
import uuid from 'react-native-uuid';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [settings, setSettings] = useState({ currency: 'USD', notifications: true });
  const [loading, setLoading] = useState(true);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
        await loadUserData(firebaseUser.uid);
      } else {
        setUser(null);
        await loadOfflineData();
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Load from Firebase ────────────────────────────────────────────────────
  const loadUserData = async (uid) => {
    try {
      const [w, t, b, r] = await Promise.all([
        fsGetCollection(`users/${uid}/wallets`),
        fsGetCollection(`users/${uid}/transactions`, orderBy('date', 'desc')),
        fsGetCollection(`users/${uid}/bills`),
        fsGetCollection(`users/${uid}/receipts`),
      ]);
      setWallets(w);
      setTransactions(t);
      setBills(b);
      setReceipts(r);
      // Cache locally
      await Promise.all([
        saveLocal(KEYS.WALLETS, w),
        saveLocal(KEYS.TRANSACTIONS, t),
        saveLocal(KEYS.BILLS, b),
        saveLocal(KEYS.RECEIPTS, r),
      ]);
    } catch (e) {
      console.warn('Firebase load failed, falling back to local', e);
      await loadOfflineData();
    }
  };

  // ── Offline fallback ───────────────────────────────────────────────────────
  const loadOfflineData = async () => {
    const [w, t, b, r, s, ai] = await Promise.all([
      loadLocal(KEYS.WALLETS),
      loadLocal(KEYS.TRANSACTIONS),
      loadLocal(KEYS.BILLS),
      loadLocal(KEYS.RECEIPTS),
      loadLocal(KEYS.SETTINGS),
      loadLocal(KEYS.AI_SUGGESTIONS),
    ]);
    setWallets(w || defaultWallets());
    setTransactions(t || defaultTransactions());
    setBills(b || []);
    setReceipts(r || []);
    setSettings(s || { currency: 'USD', notifications: true });
    setAiSuggestions(ai || []);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const recentTransactions = transactions.slice(0, 10);

  // ── CRUD: Wallets ──────────────────────────────────────────────────────────
  const addWallet = useCallback(async (walletData) => {
    const newWallet = { id: uuid.v4(), ...walletData, createdAt: new Date().toISOString() };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await saveLocal(KEYS.WALLETS, updated);
    return newWallet;
  }, [wallets]);

  const updateWallet = useCallback(async (id, data) => {
    const updated = wallets.map((w) => (w.id === id ? { ...w, ...data } : w));
    setWallets(updated);
    await saveLocal(KEYS.WALLETS, updated);
  }, [wallets]);

  const deleteWallet = useCallback(async (id) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    await saveLocal(KEYS.WALLETS, updated);
  }, [wallets]);

  // ── CRUD: Transactions ────────────────────────────────────────────────────
  const addTransaction = useCallback(async (txData) => {
    const newTx = {
      id: uuid.v4(),
      ...txData,
      date: txData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);

    // Update wallet balance
    if (txData.walletId) {
      const wallet = wallets.find((w) => w.id === txData.walletId);
      if (wallet) {
        const delta = txData.type === 'income' ? txData.amount : -txData.amount;
        await updateWallet(txData.walletId, { balance: (wallet.balance || 0) + delta });
      }
    }
    await saveLocal(KEYS.TRANSACTIONS, updated);
    return newTx;
  }, [transactions, wallets, updateWallet]);

  const updateTransaction = useCallback(async (id, data) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
    setTransactions(updated);
    await saveLocal(KEYS.TRANSACTIONS, updated);
  }, [transactions]);

  const deleteTransaction = useCallback(async (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx?.walletId) {
      const wallet = wallets.find((w) => w.id === tx.walletId);
      if (wallet) {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        await updateWallet(tx.walletId, { balance: (wallet.balance || 0) + delta });
      }
    }
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await saveLocal(KEYS.TRANSACTIONS, updated);
  }, [transactions, wallets, updateWallet]);

  // ── CRUD: Bills ────────────────────────────────────────────────────────────
  const addBill = useCallback(async (billData) => {
    const newBill = { id: uuid.v4(), ...billData, status: 'upcoming', createdAt: new Date().toISOString() };
    const updated = [...bills, newBill];
    setBills(updated);
    await saveLocal(KEYS.BILLS, updated);
    return newBill;
  }, [bills]);

  const updateBill = useCallback(async (id, data) => {
    const updated = bills.map((b) => (b.id === id ? { ...b, ...data } : b));
    setBills(updated);
    await saveLocal(KEYS.BILLS, updated);
  }, [bills]);

  const deleteBill = useCallback(async (id) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    await saveLocal(KEYS.BILLS, updated);
  }, [bills]);

  // ── CRUD: Receipts ─────────────────────────────────────────────────────────
  const addReceipt = useCallback(async (receiptData) => {
    const newReceipt = { id: uuid.v4(), ...receiptData, createdAt: new Date().toISOString() };
    const updated = [...receipts, newReceipt];
    setReceipts(updated);
    await saveLocal(KEYS.RECEIPTS, updated);
    return newReceipt;
  }, [receipts]);

  const deleteReceipt = useCallback(async (id) => {
    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);
    await saveLocal(KEYS.RECEIPTS, updated);
  }, [receipts]);

  // ── Settings ───────────────────────────────────────────────────────────────
  const updateSettings = useCallback(async (data) => {
    const updated = { ...settings, ...data };
    setSettings(updated);
    await saveLocal(KEYS.SETTINGS, updated);
  }, [settings]);

  const value = {
    user, setUser,
    wallets, addWallet, updateWallet, deleteWallet,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    bills, addBill, updateBill, deleteBill,
    receipts, addReceipt, deleteReceipt,
    aiSuggestions, setAiSuggestions,
    settings, updateSettings,
    totalBalance, totalIncome, totalExpense, recentTransactions,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ── Demo/Default Data ─────────────────────────────────────────────────────────
const defaultWallets = () => [
  { id: 'w1', name: 'Cash', type: 'cash', balance: 5200, color: '#7C3AED', icon: 'wallet' },
  { id: 'w2', name: 'Bank Account', type: 'bank', balance: 7701.25, color: '#10B981', icon: 'bank' },
  { id: 'w3', name: 'Credit Card', type: 'credit', balance: -1200, color: '#EF4444', icon: 'credit-card' },
];

const defaultTransactions = () => [
  { id: 't1', type: 'income', amount: 3000, category: 'Salary', description: 'Monthly salary', walletId: 'w2', date: new Date().toISOString(), icon: 'briefcase' },
  { id: 't2', type: 'expense', amount: 45.5, category: 'Food & Dining', description: 'Starbucks Coffee', walletId: 'w1', date: new Date().toISOString(), icon: 'coffee' },
  { id: 't3', type: 'expense', amount: 120, category: 'Shopping', description: 'Amazon Purchase', walletId: 'w3', date: new Date(Date.now() - 86400000).toISOString(), icon: 'shopping-cart' },
  { id: 't4', type: 'expense', amount: 59.99, category: 'Entertainment', description: 'Netflix Subscription', walletId: 'w2', date: new Date(Date.now() - 172800000).toISOString(), icon: 'play-circle' },
  { id: 't5', type: 'income', amount: 500, category: 'Freelance', description: 'Design project', walletId: 'w1', date: new Date(Date.now() - 259200000).toISOString(), icon: 'monitor' },
];
