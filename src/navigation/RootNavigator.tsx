import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import tokenManager from '@/services/auth/tokenManager';

import type { RootStackParamList } from './types';

// Import navigators
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import screens
import QRScannerScreen from '@/screens/Common/QRScannerScreen';
import ImageViewerScreen from '@/screens/Common/ImageViewerScreen';
import PaymentSuccessScreen from '@/screens/Payment/PaymentSuccessScreen';
import PaymentErrorScreen from '@/screens/Payment/PaymentErrorScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [forceAuthRedirect, setForceAuthRedirect] = useState(false);

  // Track when initial auth check is complete
  useEffect(() => {
    // After the first auth check completes, mark initial load as done
    // Use a timeout to ensure we don't show loading screen on subsequent auth operations
    if (!isLoading && !initialLoadComplete) {
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, initialLoadComplete]);

  // Listen to token manager events for authentication state changes
  useEffect(() => {
    const handleLoginRequired = () => {
      setForceAuthRedirect(true);
      // Trigger logout to clean up auth state
      logout().catch((error) => {
        console.error('[RootNavigator] Failed to logout on token expiry:', error);
      });
    };

    const handleTokenExpired = () => {
      setForceAuthRedirect(true);
      // Trigger logout to clean up auth state
      logout().catch((error) => {
        console.error('[RootNavigator] Failed to logout on token expiry:', error);
      });
    };

    // Subscribe to token manager events
    tokenManager.on('loginRequired', handleLoginRequired);
    tokenManager.on('tokenExpired', handleTokenExpired);

    // Cleanup event listeners
    return () => {
      tokenManager.off('loginRequired', handleLoginRequired);
      tokenManager.off('tokenExpired', handleTokenExpired);
    };
  }, [logout]);

  // Reset force redirect flag when authentication state changes
  useEffect(() => {
    if (!isAuthenticated && forceAuthRedirect) {
      // Navigation will happen automatically, reset the flag
      const timer = setTimeout(() => {
        setForceAuthRedirect(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, forceAuthRedirect]);

  // Only show loading screen during initial app load, not during auth operations
  if (!initialLoadComplete && isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0066A1" />
        <Text className="mt-4 text-gray-600 text-lg">Loading SureBank...</Text>
      </View>
    );
  }

  try {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
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
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentError"
            component={PaymentErrorScreen}
            options={{ headerShown: false }}
          />
        </Stack.Group>
      </Stack.Navigator>
    );
  } catch (error) {
    console.error('[RootNavigator] Error rendering navigator:', error);
    return (
      <View className="flex-1 bg-red-50 justify-center items-center p-4">
        <Text className="text-red-800 text-lg font-bold mb-2">Navigation Error</Text>
        <Text className="text-red-600 text-center">{error?.toString()}</Text>
      </View>
    );
  }
}