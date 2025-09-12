import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthScreenProps } from '@/navigation/types';

export default function ResetPasswordScreen({ navigation }: AuthScreenProps<'ResetPassword'>) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-primary mb-4">Reset Password</Text>
        <Text className="text-muted-foreground text-center">
          Reset Password screen placeholder - to be implemented in Phase 2
        </Text>
      </View>
    </SafeAreaView>
  );
}