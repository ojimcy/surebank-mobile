/**
 * Edit Schedule Screen
 *
 * Allows users to modify existing scheduled contributions.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { DashboardScreenProps } from '@/navigation/types';
import NestedHeader from '@/components/navigation/NestedHeader';
import {
  useScheduleQuery,
  useUpdateScheduleMutation,
} from '@/hooks/queries/useScheduleQueries';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePinVerification } from '@/hooks/usePinVerificationFallback';
import Toast from 'react-native-toast-message';

type RouteProps = DashboardScreenProps<'EditSchedule'>['route'];
type NavigationProps = DashboardScreenProps<'EditSchedule'>['navigation'];

interface EditScheduleForm {
  amount: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  storedCardId: string;
  endDate?: Date | null;
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const schema = yup.object({
  amount: yup
    .string()
    .required('Amount is required')
    .test('valid-amount', 'Enter a valid amount', (value) => {
      const num = parseFloat(value || '');
      return !isNaN(num) && num > 0;
    }),
  frequency: yup
    .string()
    .oneOf(['daily', 'weekly', 'bi-weekly', 'monthly'], 'Invalid frequency')
    .required('Frequency is required'),
  storedCardId: yup.string().required('Payment card is required'),
  endDate: yup.date().nullable().min(new Date(), 'End date must be in the future'),
});

export default function EditScheduleScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { scheduleId } = route.params;
  const { verifyPin } = usePinVerification();

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    data: schedule,
    isLoading: isScheduleLoading,
  } = useScheduleQuery(scheduleId);

  const { cards, isCardsLoading } = useCardQueries();
  const updateMutation = useUpdateScheduleMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<EditScheduleForm>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      amount: '',
      frequency: 'monthly',
      storedCardId: '',
      endDate: null,
    },
  });

  const watchedEndDate = watch('endDate');

  useEffect(() => {
    if (schedule) {
      setValue('amount', schedule.amount.toString());
      setValue('frequency', schedule.frequency as any);
      setValue('storedCardId', typeof schedule.storedCardId === 'string' ? schedule.storedCardId : schedule.storedCardId.id);
      if (schedule.endDate) {
        setValue('endDate', new Date(schedule.endDate));
      }
    }
  }, [schedule, setValue]);

  const onSubmit = async (data: EditScheduleForm) => {
    const verified = await verifyPin({
      title: 'Update Schedule',
      description: 'Enter your PIN to update this schedule',
    });

    if (!verified) return;

    const updateData = {
      amount: parseFloat(data.amount),
      frequency: data.frequency,
      storedCardId: data.storedCardId,
      endDate: data.endDate?.toISOString(),
    };

    updateMutation.mutate(
      { scheduleId, data: updateData },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Schedule Updated',
            text2: 'Your schedule has been updated successfully',
          });
          navigation.goBack();
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Update Failed',
            text2: error?.response?.data?.message || 'Failed to update schedule',
          });
        },
      }
    );
  };

  const renderPackageInfo = () => {
    if (!schedule) return null;

    return (
      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <Text className="text-sm text-blue-600 font-medium mb-2">Package Information</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Package Type</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {schedule.contributionType}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Start Date</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {formatDate(schedule.startDate)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Total Payments</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {schedule.totalPayments || 0}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isScheduleLoading || isCardsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <NestedHeader title="Edit Schedule" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0066A1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!schedule) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <NestedHeader title="Edit Schedule" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-900 text-lg font-semibold">Schedule Not Found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 px-6 py-3 bg-primary-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (schedule.status === 'cancelled' || schedule.status === 'completed') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <NestedHeader title="Edit Schedule" />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Cannot Edit Schedule</Text>
          <Text className="text-gray-600 text-center mt-2">
            This schedule is {schedule.status} and cannot be edited.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-6 px-6 py-3 bg-primary-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <NestedHeader title="Edit Schedule" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {renderPackageInfo()}

          <View className="bg-white rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Update Schedule</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Amount</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <View className="relative">
                    <Text className="absolute left-3 top-3.5 text-gray-500 font-medium">₦</Text>
                    <TextInput
                      className={`bg-gray-50 px-8 py-3 rounded-lg text-gray-900 ${
                        errors.amount ? 'border border-red-500' : ''
                      }`}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.amount && (
                <Text className="text-red-500 text-xs mt-1">{errors.amount.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Frequency</Text>
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap">
                    {frequencyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                          value === option.value
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            value === option.value ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.frequency && (
                <Text className="text-red-500 text-xs mt-1">{errors.frequency.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Payment Card</Text>
              <Controller
                control={control}
                name="storedCardId"
                render={({ field: { onChange, value } }) => (
                  <View>
                    {cards.map((card) => (
                      <TouchableOpacity
                        key={card._id}
                        onPress={() => onChange(card._id)}
                        className={`flex-row items-center justify-between p-3 mb-2 rounded-lg border ${
                          value === card._id
                            ? 'bg-primary-50 border-primary-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="card-outline"
                            size={20}
                            color={value === card._id ? '#0066A1' : '#6b7280'}
                          />
                          <View className="ml-3">
                            <Text className="font-medium text-gray-900">
                              •••• {card.lastFourDigits}
                            </Text>
                            <Text className="text-xs text-gray-600">{card.bank}</Text>
                          </View>
                        </View>
                        {value === card._id && (
                          <Ionicons name="checkmark-circle" size={20} color="#0066A1" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.storedCardId && (
                <Text className="text-red-500 text-xs mt-1">{errors.storedCardId.message}</Text>
              )}
              {cards.length === 0 && (
                <View className="bg-yellow-50 p-3 rounded-lg">
                  <Text className="text-yellow-800 text-sm">
                    No payment cards available. Add a card first.
                  </Text>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="bg-gray-50 p-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className={watchedEndDate ? 'text-gray-900' : 'text-gray-400'}>
                  {watchedEndDate ? formatDate(watchedEndDate) : 'Select end date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
              {watchedEndDate && (
                <TouchableOpacity
                  onPress={() => setValue('endDate', null)}
                  className="mt-2"
                >
                  <Text className="text-red-600 text-sm">Clear end date</Text>
                </TouchableOpacity>
              )}
              {errors.endDate && (
                <Text className="text-red-500 text-xs mt-1">{errors.endDate.message}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || updateMutation.isPending}
              className={`py-3 rounded-lg items-center ${
                isValid && !updateMutation.isPending
                  ? 'bg-primary-600'
                  : 'bg-gray-300'
              }`}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Update Schedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showEndDatePicker && (
        <DateTimePicker
          value={watchedEndDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setValue('endDate', selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}