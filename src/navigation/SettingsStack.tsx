import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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
        name="SettingsHome" 
        component={SettingsHomeScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ title: 'Account' }}
      />
      <Stack.Screen 
        name="Security" 
        component={SecurityScreen} 
        options={{ title: 'Security' }}
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ title: 'Preferences' }}
      />
      <Stack.Screen 
        name="ExchangeConnections" 
        component={ExchangeConnectionsScreen} 
        options={{ title: 'Exchange Connections' }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: 'Support' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  );
}