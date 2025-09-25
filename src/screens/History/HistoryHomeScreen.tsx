import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HistoryStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<HistoryStackParamList, 'HistoryHome'>;

export default function HistoryHomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Immediately navigate to TransactionHistory
    navigation.replace('TransactionHistory');
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <ActivityIndicator size="large" color="#0066A1" />
      </View>
    </SafeAreaView>
  );
}
