import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabParamList } from './types';

// Import stack navigators
import StoreStack from './StoreStack';
import PackageStack from './PackageStack';
import ProductsStack from './ProductsStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="StoreTab"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0066A1', // Blue to match Capacitor app
          tabBarInactiveTintColor: '#6c757d', // Muted text
          tabBarStyle: {
            backgroundColor: '#ffffff', // White background
            borderTopWidth: 0, // Remove top border
            elevation: 8, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            paddingBottom: Math.max(insets.bottom, 8), // Use safe area bottom or minimum 8px
            paddingTop: 8,
            height: 70 + insets.bottom, // Adjust height to include safe area
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="StoreTab"
          component={StoreStack}
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

    </View>
  );
}