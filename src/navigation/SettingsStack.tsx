import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, homeScreenOptions, secondaryScreenOptions } from './navigationTheme';

import type { SettingsStackParamList } from './types';

// Import settings screens (placeholder components for now)
import SettingsHomeScreen from '@/screens/Settings/SettingsHomeScreen';
import ProfileScreen from '@/screens/Settings/ProfileScreen';
import AccountScreen from '@/screens/Settings/AccountScreen';
import SecurityScreen from '@/screens/Settings/SecurityScreen';
import PreferencesScreen from '@/screens/Settings/PreferencesScreen';
import ExchangeConnectionsScreen from '@/screens/Settings/ExchangeConnectionsScreen';
import SupportScreen from '@/screens/Settings/SupportScreen';
import AboutScreen from '@/screens/Settings/AboutScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{
          ...homeScreenOptions,
          title: 'Settings'
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Profile'
        }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Account'
        }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Security'
        }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Preferences'
        }}
      />
      <Stack.Screen
        name="ExchangeConnections"
        component={ExchangeConnectionsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Exchange Connections'
        }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Support'
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'About'
        }}
      />
    </Stack.Navigator>
  );
}