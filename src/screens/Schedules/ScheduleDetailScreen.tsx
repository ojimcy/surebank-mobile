/**
 * Schedule Detail Screen
 *
 * Displays detailed information about a scheduled contribution
 * including payment history and management options.
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { DashboardScreenProps } from '@/navigation/types';
import NestedHeader from '@/components/navigation/NestedHeader';

type RouteProps = DashboardScreenProps<'ScheduleDetail'>['route'];

export default function ScheduleDetailScreen() {
  const route = useRoute<RouteProps>();
  const { scheduleId } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <NestedHeader title="Schedule Details" />
      <ScrollView className="flex-1 px-4 py-4">
        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Schedule Details
          </Text>
          <Text className="text-gray-600 text-center">
            Details for schedule: {scheduleId}
          </Text>
          <Text className="text-sm text-gray-500 mt-4">
            This screen will display full schedule details, payment history, and management options.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}