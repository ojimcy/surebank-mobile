/**
 * SureBank Mobile Application
 */

import './global.css';

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/ToastConfig';

enableScreens();

// Import providers
import { QueryContextProvider } from '@/contexts/QueryContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Import navigation
import { RootNavigator } from '@/navigation';
import { navigationRef } from '@/navigation/NavigationService';

export default function App() {
  console.log('[App] App component rendering...');

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => console.log('[App] Navigation ready')}
          theme={{
            dark: false,
            colors: {
              primary: '#0066A1',
              background: '#ffffff',
              card: '#ffffff',
              text: '#1a1a1a',
              border: '#e5e5e5',
              notification: '#0066A1',
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' as const },
              medium: { fontFamily: 'System', fontWeight: '500' as const },
              bold: { fontFamily: 'System', fontWeight: '600' as const },
              heavy: { fontFamily: 'System', fontWeight: '700' as const },
            },
          }}
        >
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <QueryContextProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryContextProvider>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}