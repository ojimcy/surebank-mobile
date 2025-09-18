import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions } from './navigationTheme';

import type { TradingStackParamList } from './types';

// Import trading screens (placeholder components for now)
import TradingHomeScreen from '@/screens/Trading/TradingHomeScreen';
import BotManagementScreen from '@/screens/Trading/BotManagementScreen';
import CreateBotScreen from '@/screens/Trading/CreateBotScreen';
import EditBotScreen from '@/screens/Trading/EditBotScreen';
import BotDetailsScreen from '@/screens/Trading/BotDetailsScreen';

const Stack = createStackNavigator<TradingStackParamList>();

export default function TradingStack() {
  return (
    <Stack.Navigator
      initialRouteName="TradingHome"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen 
        name="TradingHome" 
        component={TradingHomeScreen} 
        options={{ title: 'Trading' }}
      />
      <Stack.Screen 
        name="BotManagement" 
        component={BotManagementScreen} 
        options={{ title: 'Bot Management' }}
      />
      <Stack.Screen 
        name="CreateBot" 
        component={CreateBotScreen} 
        options={{ title: 'Create Bot' }}
      />
      <Stack.Screen 
        name="EditBot" 
        component={EditBotScreen} 
        options={{ title: 'Edit Bot' }}
      />
      <Stack.Screen 
        name="BotDetails" 
        component={BotDetailsScreen} 
        options={{ title: 'Bot Details' }}
      />
    </Stack.Navigator>
  );
}