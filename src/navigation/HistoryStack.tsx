import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type { HistoryStackParamList } from './types';

// Import history screens (placeholder components for now)
import HistoryHomeScreen from '@/screens/History/HistoryHomeScreen';
import TransactionsScreen from '@/screens/History/TransactionsScreen';
import TradesScreen from '@/screens/History/TradesScreen';
import OrdersScreen from '@/screens/History/OrdersScreen';
import ReportsScreen from '@/screens/History/ReportsScreen';

const Stack = createStackNavigator<HistoryStackParamList>();

export default function HistoryStack() {
  return (
    <Stack.Navigator
      initialRouteName="HistoryHome"
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: '#1a1a1b',
          borderBottomWidth: 1,
          borderBottomColor: '#3a3a3b',
        },
        headerTintColor: '#06b6d4', // Electric cyan
        headerTitleStyle: { 
          fontWeight: '600',
          color: '#eaeaeb',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="HistoryHome" 
        component={HistoryHomeScreen} 
        options={{ title: 'History' }}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen 
        name="Trades" 
        component={TradesScreen} 
        options={{ title: 'Trades' }}
      />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ title: 'Orders' }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Reports' }}
      />
    </Stack.Navigator>
  );
}