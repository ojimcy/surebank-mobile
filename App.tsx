/**
 * SureBank Mobile Application
 */

import './global.css';

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import providers
import { QueryContextProvider } from '@/contexts/QueryContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PinSecurityProvider } from '@/contexts/PinSecurityContext';

// Import navigation
import { RootNavigator } from '@/navigation';
import { navigationRef } from '@/navigation/NavigationService';

export default function App() {
  console.log('[App] App component rendering...');
  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <QueryContextProvider>
          <AuthProvider>
            <PinSecurityProvider>
              <NavigationContainer
                  ref={navigationRef}
                  theme={{
                    dark: false,
                    colors: {
                      primary: '#0066A1',     // SureBank primary blue
                      background: '#ffffff',   // White background
                      card: '#ffffff',        // White card background
                      text: '#1a1a1a',        // Dark text
                      border: '#e5e5e5',      // Light border
                      notification: '#0066A1', // Primary notifications
                    },
                    fonts: {
                      regular: { fontFamily: 'System', fontWeight: '400' as const },
                      medium: { fontFamily: 'System', fontWeight: '500' as const },
                      bold: { fontFamily: 'System', fontWeight: '600' as const },
                      heavy: { fontFamily: 'System', fontWeight: '700' as const },
                    },
                  }}
                >
                  <RootNavigator />
                </NavigationContainer>
            </PinSecurityProvider>
          </AuthProvider>
        </QueryContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
