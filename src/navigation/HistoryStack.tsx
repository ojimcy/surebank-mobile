import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, homeScreenOptions, secondaryScreenOptions } from './navigationTheme';

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
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="HistoryHome"
        component={HistoryHomeScreen}
        options={{
          ...homeScreenOptions,
          title: 'History'
        }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Transactions'
        }}
      />
      <Stack.Screen
        name="Trades"
        component={TradesScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Trades'
        }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Orders'
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Reports'
        }}
      />
    </Stack.Navigator>
  );
}