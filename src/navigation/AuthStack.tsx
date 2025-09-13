import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type { AuthStackParamList } from './types';

// Import auth screens
import OnboardingScreen from '@/screens/Auth/OnboardingScreen';
import AuthenticationScreen from '@/screens/Auth/AuthenticationScreen';
import VerificationScreen from '@/screens/Auth/VerificationScreen';
import PasswordRecoveryScreen from '@/screens/Auth/PasswordRecoveryScreen';
import PINSetupScreen from '@/screens/Auth/PINSetupScreen';

// Keep old screens for backward compatibility (will be removed later)
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import WelcomeScreen from '@/screens/Auth/WelcomeScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  console.log('[AuthStack] Rendering AuthStack...');
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Authentication" component={AuthenticationScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} />
      <Stack.Screen name="PINSetup" component={PINSetupScreen} />
      
      {/* Keep old screens for backward compatibility */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}