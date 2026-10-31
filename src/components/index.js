 // components/index.js — Shared UI components

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, BorderRadius, Fonts } from '../utils/theme';

const { width } = Dimensions.get('window');

// ── GradientCard ──────────────────────────────────────────────────────────────
export const GradientCard = ({ children, style, colors = Colors.gradient }) => (
  <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradientCard, style]}>
    {children}
  </LinearGradient>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
};

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ title, onPress, variant = 'primary', loading, style, textStyle, disabled }) => {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        isDanger && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : '#fff'} size="small" />
      ) : (
        <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, style, inputStyle, ...props }) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, inputStyle]}
      placeholderTextColor={Colors.textMuted}
      {...props}
    />
  </View>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── AmountText ────────────────────────────────────────────────────────────────
export const AmountText = ({ amount, type = 'expense', size = 'md', style }) => {
  const color = type === 'income' ? Colors.income : Colors.expense;
  const prefix = type === 'income' ? '+' : '-';
  const fontSize = size === 'lg' ? 24 : size === 'sm' ? 13 : 16;
  return (
    <Text style={[{ color, fontSize, fontWeight: '700' }, style]}>
      {prefix}${Math.abs(amount).toFixed(2)}
    </Text>
  );
};

// ── CategoryBadge ─────────────────────────────────────────────────────────────
export const CategoryBadge = ({ category, style }) => (
  <View style={[styles.badge, style]}>
    <Text style={styles.badgeText}>{category}</Text>
  </View>
);

// ── LoadingOverlay ────────────────────────────────────────────────────────────
export const LoadingOverlay = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, subtitle }) => (
  <View style={styles.emptyState}>
    <Text style={{ fontSize: 48 }}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ── StatusPill ────────────────────────────────────────────────────────────────
export const StatusPill = ({ status }) => {
  const config = {
    paid: { color: Colors.paid, bg: '#D1FAE5', label: 'Paid' },
    upcoming: { color: Colors.upcoming, bg: '#FEF3C7', label: 'Upcoming' },
    overdue: { color: Colors.overdue, bg: '#FEE2E2', label: 'Overdue' },
  }[status] || { color: Colors.textMuted, bg: Colors.borderLight, label: status };

  return (
    <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusPillText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonDanger: {
    backgroundColor: Colors.accentRed,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextOutline: { color: Colors.primary },
  inputWrapper: { marginBottom: Spacing.sm },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
});
