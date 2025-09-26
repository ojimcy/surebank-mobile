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
import { PaystackProvider } from 'react-native-paystack-webview';
import Config from '@/config/config';

// Create a wrapper component to handle empty publicKey gracefully
const PaystackWrapper = ({ children, publicKey }: { children: React.ReactNode; publicKey: string }) => {
  if (!publicKey) {
    console.warn('PaystackProvider: No public key provided, payments will not work');
    return <>{children}</>;
  }
  return <PaystackProvider publicKey={publicKey}>{children}</PaystackProvider>;
};

// Set displayName for debugging
PaystackWrapper.displayName = 'PaystackWrapper';

enableScreens();

// Import providers
import { QueryContextProvider } from '@/contexts/QueryContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Import navigation
import { RootNavigator } from '@/navigation';
import { navigationRef } from '@/navigation/NavigationService';

export default function App() {

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => { }}
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
          <PaystackWrapper publicKey={Config.PAYSTACK_PUBLIC_KEY}>
            <QueryContextProvider>
              <AuthProvider>
                <NotificationProvider>
                  <RootNavigator />
                </NotificationProvider>
              </AuthProvider>
            </QueryContextProvider>
          </PaystackWrapper>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}