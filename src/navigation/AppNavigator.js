// AppNavigator.js — Bottom Tab + Stack Navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { Colors } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import BillsScreen from '../screens/BillsScreen';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Custom Tab Bar ────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏠' },
  Transactions: { active: '💳', inactive: '💳' },
  Bills: { active: '🧾', inactive: '🧾' },
  Insights: { active: '📊', inactive: '📊' },
  Profile: { active: '👤', inactive: '👤' },
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.bar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label = route.name;

        // Central FAB for Transactions
        if (label === 'Transactions') {
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.fab}
              onPress={() => navigation.navigate(route.name)}>
              <View style={[tabStyles.fabInner, isFocused && { backgroundColor: Colors.primaryDark }]}>
                <Text style={{ fontSize: 22 }}>💳</Text>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.tab}
            onPress={() => navigation.navigate(route.name)}>
            <Text style={{ fontSize: 22 }}>{TAB_ICONS[label]?.active || '•'}</Text>
            <Text style={[tabStyles.tabLabel, isFocused && { color: Colors.primary }]}>{label}</Text>
            {isFocused && <View style={tabStyles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main Tab Navigator ────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Bills" component={BillsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Auth Stack ────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Main App Stack ────────────────────────────────────────────────────────────
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Wallets"
        component={ProfileScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Receipts"
        component={ReceiptsScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <Text style={{ fontSize: 32 }}>💜</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.primary, marginTop: 12 }}>FinSight</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.tabInactive,
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fab: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
