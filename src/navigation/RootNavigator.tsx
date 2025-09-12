import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type { RootStackParamList } from './types';

// Import navigators
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import screens
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';
import QRScannerScreen from '@/screens/Common/QRScannerScreen';
import ImageViewerScreen from '@/screens/Common/ImageViewerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // TODO: Replace with actual authentication logic
  const isAuthenticated = true;
  const hasCompletedOnboarding = true;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      
      {/* Modal screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{ headerShown: true, title: 'Scan QR Code' }}
        />
        <Stack.Screen 
          name="ImageViewer" 
          component={ImageViewerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}