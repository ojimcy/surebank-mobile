import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Overview" 
        component={OverviewScreen} 
        options={{ title: 'Overview' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="MarketOverview" 
        component={MarketOverviewScreen} 
        options={{ title: 'Market Overview' }}
      />
    </Stack.Navigator>
  );
}