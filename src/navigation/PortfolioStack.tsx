import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type { PortfolioStackParamList } from './types';

// Import portfolio screens (placeholder components for now)
import PortfolioHomeScreen from '@/screens/Portfolio/PortfolioHomeScreen';
import AssetsScreen from '@/screens/Portfolio/AssetsScreen';
import PerformanceScreen from '@/screens/Portfolio/PerformanceScreen';
import PositionsScreen from '@/screens/Portfolio/PositionsScreen';
import AssetDetailsScreen from '@/screens/Portfolio/AssetDetailsScreen';

const Stack = createStackNavigator<PortfolioStackParamList>();

export default function PortfolioStack() {
  return (
    <Stack.Navigator
      initialRouteName="PortfolioHome"
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
        name="PortfolioHome" 
        component={PortfolioHomeScreen} 
        options={{ title: 'Portfolio' }}
      />
      <Stack.Screen 
        name="Assets" 
        component={AssetsScreen} 
        options={{ title: 'Assets' }}
      />
      <Stack.Screen 
        name="Performance" 
        component={PerformanceScreen} 
        options={{ title: 'Performance' }}
      />
      <Stack.Screen 
        name="Positions" 
        component={PositionsScreen} 
        options={{ title: 'Positions' }}
      />
      <Stack.Screen 
        name="AssetDetails" 
        component={AssetDetailsScreen} 
        options={{ title: 'Asset Details' }}
      />
    </Stack.Navigator>
  );
}