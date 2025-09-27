/**
 * Edit Schedule Screen
 *
 * Allows users to modify existing scheduled contributions.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { DashboardScreenProps } from '@/navigation/types';
import NestedHeader from '@/components/navigation/NestedHeader';

type RouteProps = DashboardScreenProps<'EditSchedule'>['route'];

export default function EditScheduleScreen() {
  const route = useRoute<RouteProps>();
  const { scheduleId } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <NestedHeader title="Edit Schedule" />
      <ScrollView className="flex-1 px-4 py-4">
        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Edit Schedule
          </Text>
          <Text className="text-gray-600 text-center">
            Editing schedule: {scheduleId}
          </Text>
          <Text className="text-sm text-gray-500 mt-4">
            This screen will allow users to edit amount, frequency, and end date of existing schedules.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}