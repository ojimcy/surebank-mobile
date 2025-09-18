import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, homeScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';

import type { DashboardStackParamList } from './types';

// Import dashboard screens (placeholder components for now)
import DashboardScreen from '@/screens/Dashboard/DashboardScreen';
import OverviewScreen from '@/screens/Dashboard/OverviewScreen';
import AnalyticsScreen from '@/screens/Dashboard/AnalyticsScreen';
import NotificationsScreen from '@/screens/Dashboard/NotificationsScreen';
import MarketOverviewScreen from '@/screens/Dashboard/MarketOverviewScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          ...mainScreenOptions,
          title: 'Dashboard'
        }}
      />
      <Stack.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Overview'
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Analytics'
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Notifications'
        }}
      />
      <Stack.Screen
        name="MarketOverview"
        component={MarketOverviewScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Market Overview'
        }}
      />
    </Stack.Navigator>
  );
}