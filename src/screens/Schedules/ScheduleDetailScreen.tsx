/**
 * Schedule Detail Screen
 *
 * Displays detailed information about a scheduled contribution
 * including payment history and management options.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Edit,
  Trash2,
} from 'lucide-react-native';
import type { DashboardScreenProps } from '@/navigation/types';
import NestedHeader from '@/components/navigation/NestedHeader';
import {
  useScheduleQuery,
  usePaymentLogsQuery,
  usePauseScheduleMutation,
  useResumeScheduleMutation,
  useCancelScheduleMutation,
} from '@/hooks/queries/useScheduleQueries';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters';
import { usePinVerification } from '@/hooks/usePinVerificationFallback';
import Toast from 'react-native-toast-message';

type RouteProps = DashboardScreenProps<'ScheduleDetail'>['route'];
type NavigationProps = DashboardScreenProps<'ScheduleDetail'>['navigation'];

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-Weekly',
  monthly: 'Monthly',
};

const statusColors: Record<string, string> = {
  active: '#10b981',
  paused: '#f59e0b',
  suspended: '#ef4444',
  completed: '#6b7280',
  cancelled: '#6b7280',
};

const paymentStatusColors: Record<string, string> = {
  success: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  processing: '#3b82f6',
  pending_retry: '#8b5cf6',
  cancelled: '#6b7280',
};

export default function ScheduleDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { scheduleId } = route.params;
  const { verifyPin } = usePinVerification();

  const [refreshing, setRefreshing] = useState(false);
  const [logsPage, setLogsPage] = useState(1);

  const {
    data: schedule,
    isLoading: isScheduleLoading,
    refetch: refetchSchedule,
  } = useScheduleQuery(scheduleId);

  const {
    data: paymentLogsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
  } = usePaymentLogsQuery(scheduleId, { page: logsPage, limit: 10 });

  const paymentLogs = paymentLogsData?.logs || [];
  const hasNextPage = paymentLogsData ? logsPage < paymentLogsData.totalPages : false;

  const pauseMutation = usePauseScheduleMutation();
  const resumeMutation = useResumeScheduleMutation();
  const cancelMutation = useCancelScheduleMutation();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSchedule(), refetchLogs()]);
    setRefreshing(false);
  }, [refetchSchedule, refetchLogs]);

  const handlePause = useCallback(async () => {
    const verified = await verifyPin({
      title: 'Pause Schedule',
      description: 'Enter your PIN to pause this schedule',
    });

    if (!verified) return;

    Alert.alert(
      'Pause Schedule',
      'Are you sure you want to pause this schedule? You can resume it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          style: 'destructive',
          onPress: () => {
            pauseMutation.mutate(scheduleId, {
              onSuccess: () => {
                refetchSchedule();
                Toast.show({
                  type: 'success',
                  text1: 'Schedule Paused',
                  text2: 'Your schedule has been paused successfully',
                });
              },
            });
          },
        },
      ]
    );
  }, [scheduleId, pauseMutation, refetchSchedule, verifyPin]);

  const handleResume = useCallback(async () => {
    const verified = await verifyPin({
      title: 'Resume Schedule',
      description: 'Enter your PIN to resume this schedule',
    });

    if (!verified) return;

    resumeMutation.mutate(scheduleId, {
      onSuccess: () => {
        refetchSchedule();
        Toast.show({
          type: 'success',
          text1: 'Schedule Resumed',
          text2: 'Your schedule has been resumed successfully',
        });
      },
    });
  }, [scheduleId, resumeMutation, refetchSchedule, verifyPin]);

  const handleCancel = useCallback(async () => {
    const verified = await verifyPin({
      title: 'Cancel Schedule',
      description: 'Enter your PIN to cancel this schedule',
    });

    if (!verified) return;

    Alert.alert(
      'Cancel Schedule',
      'Are you sure you want to cancel this schedule? This action cannot be undone.',
      [
        { text: 'Keep Schedule', style: 'cancel' },
        {
          text: 'Cancel Schedule',
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(scheduleId, {
              onSuccess: () => {
                navigation.goBack();
                Toast.show({
                  type: 'success',
                  text1: 'Schedule Cancelled',
                  text2: 'Your schedule has been cancelled',
                });
              },
            });
          },
        },
      ]
    );
  }, [scheduleId, cancelMutation, navigation, verifyPin]);

  const handleEdit = useCallback(() => {
    if (schedule?.status === 'cancelled' || schedule?.status === 'completed') {
      Toast.show({
        type: 'error',
        text1: 'Cannot Edit',
        text2: 'This schedule cannot be edited',
      });
      return;
    }
    navigation.navigate('EditSchedule', { scheduleId });
  }, [navigation, scheduleId, schedule]);

  const renderScheduleInfo = () => {
    if (!schedule) return null;

    const nextPaymentDate = schedule.nextPaymentDate
      ? new Date(schedule.nextPaymentDate)
      : null;
    const isUpcoming = nextPaymentDate && nextPaymentDate > new Date();

    return (
      <>
        {/* Hero Card with Gradient */}
        <LinearGradient
          colors={['#0066A1', '#004d7a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-6 mb-4"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                <Calendar size={24} color="white" />
              </View>
              <View>
                <Text className="text-white/80 text-sm">Schedule Amount</Text>
                <Text className="text-white text-2xl font-bold">
                  {formatCurrency(schedule.amount)}
                </Text>
              </View>
            </View>
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Text className="text-white text-xs font-semibold capitalize">
                {schedule.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-white/70 text-xs mb-1">Frequency</Text>
              <Text className="text-white font-semibold">
                {frequencyLabels[schedule.frequency] || schedule.frequency}
              </Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-white/70 text-xs mb-1">Package Type</Text>
              <Text className="text-white font-semibold uppercase">{schedule.contributionType}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Details Card */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Schedule Details</Text>

          <View className="space-y-4">
            {/* Start Date */}
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <Calendar size={18} color="#0066A1" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Start Date</Text>
                  <Text className="font-semibold text-gray-900">{formatDate(schedule.startDate)}</Text>
                </View>
              </View>
            </View>

            {/* End Date */}
            {schedule.endDate && (
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                    <Calendar size={18} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">End Date</Text>
                    <Text className="font-semibold text-gray-900">{formatDate(schedule.endDate)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Next Payment */}
            {isUpcoming && (
              <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-3">
                      <Clock size={18} color="#10b981" />
                    </View>
                    <View>
                      <Text className="text-xs text-gray-600">Next Payment</Text>
                      <Text className="font-bold text-gray-900">{formatDate(schedule.nextPaymentDate)}</Text>
                      <Text className="text-xs text-green-600 mt-0.5">
                        {formatRelativeTime(schedule.nextPaymentDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Payment Statistics</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mb-2">
                <TrendingUp size={20} color="white" />
              </View>
              <Text className="text-xs text-gray-600 mb-1">Total Payments</Text>
              <Text className="text-2xl font-bold text-gray-900">{schedule.totalPayments || 0}</Text>
            </View>

            <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <View className="w-10 h-10 bg-green-500 rounded-xl items-center justify-center mb-2">
                <CheckCircle2 size={20} color="white" />
              </View>
              <Text className="text-xs text-gray-600 mb-1">Total Amount</Text>
              <Text className="text-lg font-bold text-gray-900">
                {formatCurrency(schedule.totalAmount || 0)}
              </Text>
            </View>
          </View>

          {schedule.failedPayments > 0 && (
            <View className="mt-3 bg-red-50 rounded-xl p-4 flex-row items-center">
              <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
                <XCircle size={20} color="#ef4444" />
              </View>
              <View>
                <Text className="text-xs text-gray-600">Failed Payments</Text>
                <Text className="text-xl font-bold text-red-600">{schedule.failedPayments}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Card */}
        {schedule.storedCardId && typeof schedule.storedCardId === 'object' && (
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Payment Method</Text>
            <LinearGradient
              colors={['#1e293b', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl p-5"
            >
              <View className="flex-row items-center justify-between mb-4">
                <CreditCard size={32} color="white" />
                <Text className="text-white/60 text-xs font-semibold uppercase">
                  {schedule.storedCardId.cardType || 'Debit Card'}
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-1 tracking-wider">
                •••• •••• •••• {schedule.storedCardId.last4}
              </Text>
              <Text className="text-white/80 text-sm">{schedule.storedCardId.bank}</Text>
            </LinearGradient>
          </View>
        )}
      </>
    );
  };

  const renderPaymentHistory = () => {
    if (!paymentLogs || paymentLogs.length === 0) {
      return (
        <View className="bg-white rounded-2xl p-8 items-center">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="receipt-outline" size={32} color="#9ca3af" />
          </View>
          <Text className="text-gray-900 font-semibold text-base">No Payment History</Text>
          <Text className="text-gray-500 text-sm mt-1">Payments will appear here once processed</Text>
        </View>
      );
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'success':
          return <CheckCircle2 size={16} color="#10b981" />;
        case 'failed':
          return <XCircle size={16} color="#ef4444" />;
        case 'pending':
        case 'processing':
          return <Clock size={16} color="#f59e0b" />;
        default:
          return <AlertCircle size={16} color="#6b7280" />;
      }
    };

    return (
      <View className="bg-white rounded-2xl p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Payment History</Text>

        {paymentLogs.map((log: any, index: number) => (
          <View
            key={log._id}
            className={`py-4 ${
              index !== paymentLogs.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${paymentStatusColors[log.status]}20` }}
                >
                  {getStatusIcon(log.status)}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-bold text-gray-900 text-base">
                      {formatCurrency(log.amount)}
                    </Text>
                    {log.retryCount > 0 && (
                      <View className="ml-2 px-2 py-0.5 bg-orange-100 rounded">
                        <Text className="text-xs text-orange-700">Retry #{log.retryCount}</Text>
                      </View>
                    )}
                  </View>
                  <View
                    className="mt-1 px-2 py-0.5 rounded self-start"
                    style={{ backgroundColor: `${paymentStatusColors[log.status]}15` }}
                  >
                    <Text
                      className="text-xs font-semibold capitalize"
                      style={{ color: paymentStatusColors[log.status] }}
                    >
                      {log.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Text className="text-xs text-gray-500 ml-13">
              {formatDate(log.createdAt, 'PPp')}
            </Text>
            {log.errorMessage && (
              <View className="mt-2 ml-13 bg-red-50 rounded-lg p-2">
                <Text className="text-xs text-red-700">{log.errorMessage}</Text>
              </View>
            )}
          </View>
        ))}

        {hasNextPage && (
          <TouchableOpacity
            onPress={() => setLogsPage(logsPage + 1)}
            className="mt-4 py-3 bg-gray-50 rounded-xl items-center"
          >
            <Text className="text-primary-600 font-semibold">Load More Payments</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (!schedule) return null;

    const canPause = schedule.status === 'active';
    const canResume = schedule.status === 'paused';
    const canCancel = ['active', 'paused', 'suspended'].includes(schedule.status);
    const canEdit = ['active', 'paused'].includes(schedule.status);

    return (
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row space-x-3">
          {canPause && (
            <TouchableOpacity
              onPress={handlePause}
              disabled={pauseMutation.isPending}
              className="flex-1"
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-xl items-center flex-row justify-center"
              >
                {pauseMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Pause size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Pause</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {canResume && (
            <TouchableOpacity
              onPress={handleResume}
              disabled={resumeMutation.isPending}
              className="flex-1"
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-xl items-center flex-row justify-center"
              >
                {resumeMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Play size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Resume</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {canEdit && (
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1"
            >
              <LinearGradient
                colors={['#0066A1', '#004d7a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-xl items-center flex-row justify-center"
              >
                <Edit size={18} color="white" />
                <Text className="text-white font-bold ml-2">Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {canCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
            className="mt-3"
          >
            <View className="py-4 bg-red-50 rounded-xl items-center flex-row justify-center border border-red-200">
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Trash2 size={18} color="#ef4444" />
                  <Text className="text-red-600 font-bold ml-2">Cancel Schedule</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  if (!schedule) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Schedule Not Found</Text>
          <Text className="text-gray-600 text-center mt-2">
            This schedule may have been deleted or you don&apos;t have permission to view it.
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderScheduleInfo()}
        {renderPaymentHistory()}
      </ScrollView>
      {renderActions()}
    </SafeAreaView>
  );
}