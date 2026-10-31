// AuthScreen.js — Login & Register with Firebase Auth
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { firebaseSignIn, firebaseSignUp, fsSet } from '../services/firebase';
import { Button, Input } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await firebaseSignIn(email, password);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>FS</Text>
            </View>
            <Text style={styles.appName}>FinSight</Text>
            <Text style={styles.tagline}>Smart Expense Tracker</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Button title="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: Spacing.sm }} />

            <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const cred = await firebaseSignUp(email, password);
      await fsSet(`users/${cred.user.uid}`, {
        displayName: name,
        email,
        currency: 'USD',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>FS</Text>
            </View>
            <Text style={styles.appName}>FinSight</Text>
            <Text style={styles.tagline}>Smart Expense Tracker</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start tracking your finances</Text>

            <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              secureTextEntry
            />

            <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: Spacing.sm }} />

            <TouchableOpacity style={styles.switchRow} onPress={() => navigation.goBack()}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.md },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 72, height: 72,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.md },
  switchRow: { alignItems: 'center', marginTop: Spacing.md },
  switchText: { fontSize: 14, color: Colors.textSecondary },
  switchLink: { color: Colors.primary, fontWeight: '700' },
});
