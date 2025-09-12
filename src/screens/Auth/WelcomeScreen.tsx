import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthScreenProps } from '@/navigation/types';

export default function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold text-primary mb-4">XpatTrada</Text>
        <Text className="text-lg text-muted-foreground text-center mb-8">
          AI-Powered Crypto Trading Bot
        </Text>
        
        <TouchableOpacity
          className="bg-primary py-4 px-8 rounded-lg mb-4 w-full"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-white text-center font-semibold">Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="border-2 border-primary py-4 px-8 rounded-lg w-full"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-primary text-center font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}