// storage.js — AsyncStorage wrapper for offline persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@finsight_user',
  WALLETS: '@finsight_wallets',
  TRANSACTIONS: '@finsight_transactions',
  BILLS: '@finsight_bills',
  RECEIPTS: '@finsight_receipts',
  AI_SUGGESTIONS: '@finsight_ai_suggestions',
  SETTINGS: '@finsight_settings',
};

export { KEYS };

export const saveLocal = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('AsyncStorage save error:', e);
  }
};

export const loadLocal = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('AsyncStorage load error:', e);
    return null;
  }
};

export const removeLocal = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('AsyncStorage remove error:', e);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (e) {
    console.warn('AsyncStorage clear error:', e);
  }
};
