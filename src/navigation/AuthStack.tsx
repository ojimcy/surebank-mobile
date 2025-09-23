import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { storage, STORAGE_KEYS } from '@/services/storage';

import type { AuthStackParamList } from './types';

// Import auth screens
import OnboardingScreen from '@/screens/Auth/OnboardingScreen';
// import AuthenticationScreen from '@/screens/Auth/AuthenticationScreen'; // Using standalone Login/Register instead
import VerificationScreen from '@/screens/Auth/VerificationScreen';
import PasswordRecoveryScreen from '@/screens/Auth/PasswordRecoveryScreen';
import PINSetupScreen from '@/screens/Auth/PINSetupScreen';

// Import auth screens
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import VerifyResetCodeScreen from '@/screens/Auth/VerifyResetCodeScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import WelcomeScreen from '@/screens/Auth/WelcomeScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Check onboarding status directly from storage
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('[AuthStack] Error checking onboarding:', error);
        setHasCompletedOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  console.log('[AuthStack] Rendering AuthStack...', { hasCompletedOnboarding });

  // Don't render until we know the onboarding status
  if (hasCompletedOnboarding === null) {
    return null;
  }

  // Determine initial route based on onboarding status
  const initialRouteName = hasCompletedOnboarding ? 'Login' : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }, // White background
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      {/* <Stack.Screen name="Authentication" component={AuthenticationScreen} /> */}
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} />
      <Stack.Screen name="PINSetup" component={PINSetupScreen} />

      {/* Keep old screens for backward compatibility */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}