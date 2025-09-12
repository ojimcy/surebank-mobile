import React from 'react';
import { View, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthScreenProps } from '@/navigation/types';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-primary mb-4">Login</Text>
        <Text className="text-muted-foreground text-center">
          Login screen placeholder - to be implemented in Phase 2
        </Text>
      </View>

      {/* navigate to dashboard */}
      <Button title="Dashboard" onPress={() => navigation.navigate('Main')} />
    </SafeAreaView>
  );
}