import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type { AuthStackParamList } from './types';

// Import auth screens (placeholder components for now)
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import WelcomeScreen from '@/screens/Auth/WelcomeScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}