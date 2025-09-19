import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';

import type { PortfolioStackParamList } from './types';

// Import portfolio screens (placeholder components for now)
import PortfolioHomeScreen from '@/screens/Portfolio/PortfolioHomeScreen';
import NewPackageScreen from '@/screens/Portfolio/NewPackageScreen';
import PackageDetailScreen from '@/screens/Portfolio/PackageDetailScreen';
import CreateDailySavingsScreen from '@/screens/Portfolio/CreateDailySavingsScreen';
import CreateIBSPackageScreen from '@/screens/Portfolio/CreateIBSPackageScreen';
import CreateSBPackageScreen from '@/screens/Portfolio/CreateSBPackageScreen';
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
        name="NewPackage"
        component={NewPackageScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'New Package'
        }}
      />
      <Stack.Screen
        name="PackageDetail"
        component={PackageDetailScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Package Details'
        }}
      />
      <Stack.Screen
        name="CreateDailySavings"
        component={CreateDailySavingsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Daily Savings'
        }}
      />
      <Stack.Screen
        name="CreateIBSPackage"
        component={CreateIBSPackageScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Interest-Based'
        }}
      />
      <Stack.Screen
        name="CreateSBPackage"
        component={CreateSBPackageScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'SB Package'
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