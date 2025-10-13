/**
 * Store Stack Navigator
 * Navigation stack for the e-commerce store experience
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, mainScreenOptions } from './navigationTheme';

import type { StoreStackParamList } from './types';

// Import store screens
import StoreHomeScreen from '@/screens/Store/StoreHomeScreen';

const Stack = createStackNavigator<StoreStackParamList>();

export default function StoreStack() {
  return (
    <Stack.Navigator
      initialRouteName="StoreHome"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="StoreHome"
        component={StoreHomeScreen}
        options={{
          ...mainScreenOptions,
          title: 'Store'
        }}
      />
    </Stack.Navigator>
  );
}
