import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssetsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-primary mb-4">Assets</Text>
        <Text className="text-muted-foreground text-center">
          Assets screen placeholder - to be implemented in future phases
        </Text>
      </View>
    </SafeAreaView>
  );
}