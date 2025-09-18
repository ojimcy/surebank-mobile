import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, homeScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';

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
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="PortfolioHome"
        component={PortfolioHomeScreen}
        options={{
          ...mainScreenOptions,
          title: 'Portfolio'
        }}
      />
      <Stack.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Assets'
        }}
      />
      <Stack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Performance'
        }}
      />
      <Stack.Screen
        name="Positions"
        component={PositionsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Positions'
        }}
      />
      <Stack.Screen
        name="AssetDetails"
        component={AssetDetailsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Asset Details'
        }}
      />
    </Stack.Navigator>
  );
}