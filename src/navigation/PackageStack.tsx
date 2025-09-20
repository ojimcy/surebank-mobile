import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';

import type { PackageStackParamList } from './types';

// Import package screens (placeholder components for now)
import PackagesHomeScreen from '@/screens/Package/PackagesHomeScreen';
import NewPackageScreen from '@/screens/Package/NewPackageScreen';
import PackageDetailScreen from '@/screens/Package/PackageDetailScreen';
import CreateDailySavingsScreen from '@/screens/Package/CreateDailySavingsScreen';
import CreateIBSPackageScreen from '@/screens/Package/CreateIBSPackageScreen';
import CreateSBPackageScreen from '@/screens/Package/CreateSBPackageScreen';
import AssetsScreen from '@/screens/Package/AssetsScreen';
import PerformanceScreen from '@/screens/Package/PerformanceScreen';
import PositionsScreen from '@/screens/Package/PositionsScreen';
import AssetDetailsScreen from '@/screens/Package/AssetDetailsScreen';

const Stack = createStackNavigator<PackageStackParamList>();

export default function PackageStack() {
  return (
    <Stack.Navigator
      initialRouteName="PackageHome"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="PackageHome"
        component={PackagesHomeScreen}
        options={{
          ...mainScreenOptions,
          title: 'Packages'
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