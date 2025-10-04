/**
 * Schedules List Screen
 *
 * Main screen for viewing and managing scheduled contributions.
 * Displays statistics, active schedules, and management options.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DashboardStackNavigationProp } from '@/navigation/types';
import {
  Calendar,
  Plus,
  Play,
  Pause,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  CreditCard,
  Activity,
  XCircle,
} from 'lucide-react-native';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { usePinVerification } from '@/hooks/usePinVerificationFallback'; // Using fallback until PIN provider is implemented
import { ScheduledContribution, RecentActivity } from '@/services/api/scheduledContributions';
import { formatCurrency, formatDate } from '@/utils/formatters';

type FilterStatus = 'all' | 'active' | 'paused' | 'cancelled' | 'completed';
type SortBy = 'nextPayment' | 'amount' | 'created';

export default function SchedulesListScreen() {
  const navigation = useNavigation<DashboardStackNavigationProp<'SchedulesList'>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy] = useState<SortBy>('nextPayment');
  const { verifyPin } = usePinVerification();

  const {
    schedules,
    scheduleStats,
    hasSchedules,
    isSchedulesLoading,
    isScheduleStatsLoading,
    isSchedulesError,
    pauseSchedule,
    isPauseScheduleLoading,
    resumeSchedule,
    isResumeScheduleLoading,
    cancelSchedule,
    // isCancelScheduleLoading,
    refetchSchedules,
  } = useScheduleQueries();

  // Filter and sort schedules
  const filteredAndSortedSchedules = useMemo(() => {
    let filtered = schedules;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(schedule => {
        const amountStr = formatCurrency(schedule.amount).toLowerCase();
        const frequencyStr = schedule.frequency.toLowerCase();
        const search = searchTerm.toLowerCase();
        return amountStr.includes(search) || frequencyStr.includes(search);
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === filterStatus);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'nextPayment':
          return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [schedules, searchTerm, filterStatus, sortBy]);

  const handleCancelSchedule = (schedule: ScheduledContribution) => {
    Alert.alert(
      'Cancel Schedule',
      `Are you sure you want to cancel the ${schedule.frequency} schedule of ${formatCurrency(
        schedule.amount
      )}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            const pinVerified = await verifyPin({
              title: 'Cancel Schedule',
              description: `Enter your PIN to cancel the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`,
            });
            if (pinVerified) {
              const scheduleId = schedule._id || schedule.id;
              if (scheduleId) {
                cancelSchedule(scheduleId);
              }
            }
          },
        },
      ]
    );
  };

  const handlePauseSchedule = (scheduleId: string) => {
    if (scheduleId) pauseSchedule(scheduleId);
  };

  const handleResumeSchedule = (scheduleId: string) => {
    if (scheduleId) resumeSchedule(scheduleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100';
      case 'paused':
        return 'bg-yellow-100';
      case 'cancelled':
        return 'bg-red-100';
      case 'completed':
        return 'bg-blue-100';
      case 'suspended':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-800';
      case 'paused':
        return 'text-yellow-800';
      case 'cancelled':
        return 'text-red-800';
      case 'completed':
        return 'text-blue-800';
      case 'suspended':
        return 'text-orange-800';
      default:
        return 'text-gray-800';
    }
  };

  if (isSchedulesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0066A1" />
      </View>
    );
  }

  if (isSchedulesError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 p-4">
          <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center">
            <AlertCircle size={48} color="#DC2626" />
            <Text className="text-lg font-semibold text-red-800 mt-4 mb-2">
              Error Loading Schedules
            </Text>
            <Text className="text-red-600 text-center mb-4">
              We couldn&apos;t load your scheduled contributions. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => refetchSchedules()}
              className="bg-red-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isSchedulesLoading}
            onRefresh={refetchSchedules}
            colors={['#0066A1']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 py-6 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">Scheduled Payments</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateSchedule' as never)}
              className="bg-[#0066A1] px-4 py-2 rounded-lg flex-row items-center"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-medium ml-2">Create</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={20} color="#6B7280" />
            <TextInput
              placeholder="Search by amount or frequency..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="flex-1 ml-2 text-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Statistics Cards */}
        {!isScheduleStatsLoading && scheduleStats && (
          <View className="px-4 py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                <View className="bg-white rounded-xl p-4 min-w-[140px]">
                  <View className="flex-row items-center">
                    <Calendar size={20} color="#0066A1" />
                    <View className="ml-3">
                      <Text className="text-sm text-gray-600">Total</Text>
                      <Text className="text-xl font-bold">{scheduleStats.totalSchedules}</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-white rounded-xl p-4 min-w-[140px]">
                  <View className="flex-row items-center">
                    <Play size={20} color="#10B981" />
                    <View className="ml-3">
                      <Text className="text-sm text-gray-600">Active</Text>
                      <Text className="text-xl font-bold">{scheduleStats.activeSchedules}</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-white rounded-xl p-4 min-w-[140px]">
                  <View className="flex-row items-center">
                    <CheckCircle2 size={20} color="#3B82F6" />
                    <View className="ml-3">
                      <Text className="text-sm text-gray-600">Successful</Text>
                      <Text className="text-xl font-bold">
                        {scheduleStats.successfulContributions}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-white rounded-xl p-4 min-w-[180px]">
                  <View className="flex-row items-center">
                    <TrendingUp size={20} color="#10B981" />
                    <View className="ml-3">
                      <Text className="text-sm text-gray-600">Total</Text>
                      <Text className="text-lg font-bold">
                        {formatCurrency(scheduleStats.totalAmountContributed)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full mr-2 ${
              filterStatus === 'all' ? 'bg-[#0066A1]' : 'bg-white border border-gray-300'
            }`}
          >
            <Text className={filterStatus === 'all' ? 'text-white' : 'text-gray-700'}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-full mr-2 ${
              filterStatus === 'active' ? 'bg-[#0066A1]' : 'bg-white border border-gray-300'
            }`}
          >
            <Text className={filterStatus === 'active' ? 'text-white' : 'text-gray-700'}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('paused')}
            className={`px-4 py-2 rounded-full mr-2 ${
              filterStatus === 'paused' ? 'bg-[#0066A1]' : 'bg-white border border-gray-300'
            }`}
          >
            <Text className={filterStatus === 'paused' ? 'text-white' : 'text-gray-700'}>
              Paused
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-full ${
              filterStatus === 'completed' ? 'bg-[#0066A1]' : 'bg-white border border-gray-300'
            }`}
          >
            <Text className={filterStatus === 'completed' ? 'text-white' : 'text-gray-700'}>
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Schedules List */}
        <View className="px-4 pb-4">
          {!hasSchedules ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Calendar size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                No Scheduled Payments Yet
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Create your first scheduled contribution to automate your savings
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateSchedule')}
                className="bg-[#0066A1] px-6 py-3 rounded-lg flex-row items-center w-full justify-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-medium ml-2">Create Your First Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('CardsList')}
                className="mt-3 px-6 py-3 rounded-lg flex-row items-center w-full justify-center border border-gray-300"
              >
                <CreditCard size={20} color="#4B5563" />
                <Text className="text-gray-700 font-medium ml-2">Manage Payment Cards</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filteredAndSortedSchedules.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Text className="text-gray-600">
                    No schedules found matching your filters
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="mt-3"
                  >
                    <Text className="text-[#0066A1]">Clear filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {filteredAndSortedSchedules.map(schedule => {
                    const scheduleId = schedule._id || schedule.id || '';
                    return (
                      <View key={scheduleId} className="bg-white rounded-xl p-4 mb-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                              <Text className="font-semibold text-lg text-gray-900">
                                {formatCurrency(schedule.amount)} {schedule.frequency}
                              </Text>
                              <View
                                className={`ml-2 px-2 py-1 rounded-full ${getStatusColor(
                                  schedule.status
                                )}`}
                              >
                                <Text
                                  className={`text-xs capitalize ${getStatusTextColor(
                                    schedule.status
                                  )}`}
                                >
                                  {schedule.status}
                                </Text>
                              </View>
                            </View>
                            <View className="flex-row items-center space-x-4">
                              <View className="flex-row items-center">
                                <Clock size={12} color="#6B7280" />
                                <Text className="text-xs text-gray-600 ml-1">
                                  Next: {formatDate(schedule.nextPaymentDate)}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <CheckCircle2 size={12} color="#6B7280" />
                                <Text className="text-xs text-gray-600 ml-1">
                                  {schedule.totalPayments - schedule.failedPayments} successful
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View className="flex-row items-center space-x-2">
                            {schedule.status === 'active' && (
                              <TouchableOpacity
                                onPress={() => handlePauseSchedule(scheduleId)}
                                disabled={isPauseScheduleLoading}
                                className="p-2"
                              >
                                <Pause size={20} color="#F59E0B" />
                              </TouchableOpacity>
                            )}
                            {schedule.status === 'paused' && (
                              <TouchableOpacity
                                onPress={() => handleResumeSchedule(scheduleId)}
                                disabled={isResumeScheduleLoading}
                                className="p-2"
                              >
                                <Play size={20} color="#10B981" />
                              </TouchableOpacity>
                            )}
                            {schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
                              <TouchableOpacity
                                onPress={() => handleCancelSchedule(schedule)}
                                className="p-2"
                              >
                                <XCircle size={20} color="#DC2626" />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('ScheduleDetail', {
                                  scheduleId,
                                })
                              }
                              className="p-2"
                            >
                              <Eye size={20} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>

        {/* Recent Activity */}
        {scheduleStats?.recentActivity && scheduleStats.recentActivity.length > 0 && (
          <View className="mx-4 mb-4">
            <View className="bg-white rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Activity size={20} color="#0066A1" />
                  <Text className="text-lg font-semibold ml-2">Recent Activity</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransactionHistory')}
                >
                  <Text className="text-[#0066A1] text-sm">View All</Text>
                </TouchableOpacity>
              </View>

              {scheduleStats.recentActivity.slice(0, 3).map((activity: RecentActivity, index) => (
                <View
                  key={activity.id || index}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-2 h-2 rounded-full ${activity.status === 'success'
                          ? 'bg-green-500'
                          : activity.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                    />
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-medium">{formatCurrency(activity.amount)}</Text>
                        <View
                          className={`ml-2 px-2 py-1 rounded-full flex-row items-center ${activity.status === 'success'
                              ? 'bg-green-100'
                              : activity.status === 'failed'
                                ? 'bg-red-100'
                                : 'bg-yellow-100'
                            }`}
                        >
                          {activity.status === 'success' ? (
                            <CheckCircle2 size={12} color="#10B981" />
                          ) : activity.status === 'failed' ? (
                            <XCircle size={12} color="#DC2626" />
                          ) : (
                            <Clock size={12} color="#F59E0B" />
                          )}
                          <Text
                            className={`text-xs ml-1 ${activity.status === 'success'
                                ? 'text-green-800'
                                : activity.status === 'failed'
                                  ? 'text-red-800'
                                  : 'text-yellow-800'
                              }`}
                          >
                            {activity.status === 'success'
                              ? 'Success'
                              : activity.status === 'failed'
                                ? 'Failed'
                                : 'Processing'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">
                        {activity.contributionType.toUpperCase()} • {formatDate(activity.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}