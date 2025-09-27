import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FloatingActionButton } from '@/components/navigation';

import type { MainTabParamList } from './types';

// Import stack navigators
import DashboardStack from './DashboardStack';
import PackageStack from './PackageStack';
import ProductsStack from './ProductsStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const navigation = useNavigation<any>();

  const handleDeposit = () => {
    navigation.navigate('DashboardTab', { screen: 'Deposit' });
  };

  const handleNewPackage = () => {
    navigation.navigate('PackageTab', { screen: 'NewPackage' });
  };

  const handleWithdraw = () => {
    navigation.navigate('DashboardTab', { screen: 'Withdraw' });
  };

  const handleMyCards = () => {
    navigation.navigate('DashboardTab', { screen: 'CardsList' });
  };

  const handleSchedules = () => {
    navigation.navigate('DashboardTab', { screen: 'SchedulesList' });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="DashboardTab"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0066A1', // Blue to match Capacitor app
          tabBarInactiveTintColor: '#6c757d', // Muted text
          tabBarStyle: {
            backgroundColor: '#ffffff', // White background
            borderTopColor: '#e5e8ed', // Light border
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStack}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="PackageTab"
          component={PackageStack}
          options={{
            title: 'Packages',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProductsTab"
          component={ProductsStack}
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bag-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Floating Action Button */}
      <FloatingActionButton
        onDeposit={handleDeposit}
        onNewPackage={handleNewPackage}
        onWithdraw={handleWithdraw}
        onMyCards={handleMyCards}
        onSchedules={handleSchedules}
      />
    </View>
  );
}