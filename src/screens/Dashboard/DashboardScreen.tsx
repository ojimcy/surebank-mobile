import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainHeader } from '@/components/navigation';
import type { DashboardScreenProps } from '@/navigation/types';

export default function DashboardScreen({ navigation }: DashboardScreenProps<'Dashboard'>) {
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleSearchPress = () => {
    // TODO: Implement search functionality
    console.log('Search pressed');
  };

  const handleAvatarPress = () => {
    // TODO: Navigate to profile or show user menu
    console.log('Avatar pressed');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <MainHeader
        onNotificationPress={handleNotificationPress}
        onAvatarPress={handleAvatarPress}
      />

      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0066A1', marginBottom: 16 }}>
            Dashboard
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
            Dashboard screen with Capacitor app style header
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}