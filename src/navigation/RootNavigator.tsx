import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';

import type { RootStackParamList } from './types';

// Import navigators
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import screens
import QRScannerScreen from '@/screens/Common/QRScannerScreen';
import ImageViewerScreen from '@/screens/Common/ImageViewerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  console.log('[RootNavigator] Rendering with state:', {
    isAuthenticated,
    isLoading,
    initialLoadComplete
  });

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

  // Only show loading screen during initial app load, not during auth operations
  if (!initialLoadComplete && isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0066A1" />
        <Text className="mt-4 text-gray-600 text-lg">Loading SureBank...</Text>
      </View>
    );
  }

  console.log('[RootNavigator] Rendering navigator, isAuthenticated:', isAuthenticated);

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