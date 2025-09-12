/**
 * XpatTrada - An AI-powered crypto trading bot
 */

import './global.css';

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import providers
import { QueryContextProvider } from '@/contexts/QueryContext';

// Import navigation
import { RootNavigator } from '@/navigation';

export default function App() {
  // Force dark theme for cyberpunk aesthetic
  const isDarkMode = true; // Always use dark theme for XpatTrada

  return (
    <GestureHandlerRootView className="flex-1 dark bg-background">
      <SafeAreaProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#0a0a0b" 
          translucent={false}
        />
        <QueryContextProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: '#a855f7',     // Electric Purple - AI Intelligence
                background: '#0a0a0b',  // Dark background
                card: '#1a1a1b',        // Card background
                text: '#eaeaeb',        // Text color
                border: '#3a3a3b',      // Border color
                notification: '#06b6d4', // Cyan notifications
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
        </QueryContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
