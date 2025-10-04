import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import notificationsService, { Notification } from '@/services/api/notifications';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsService.getNotifications({ page, limit: 20 }),
    staleTime: 30000, // 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications list and count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to mark notification as read');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to mark all notifications as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to delete notification');
    },
  });

  const handleMarkAsRead = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markAsReadMutation.mutate(notification.id);
      }
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert('Mark All as Read', 'Are you sure you want to mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark All',
        onPress: () => markAllAsReadMutation.mutate(),
      },
    ]);
  }, [markAllAsReadMutation]);

  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotificationMutation.mutate(notificationId),
        },
      ]);
    },
    [deleteNotificationMutation]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getNotificationIcon = (type: number) => {
    // Map notification types to icons
    // Types are indexed in the backend NOTIFICATION_TYPES array
    const iconMap: Record<number, string> = {
      0: 'card-outline', // account_activity
      1: 'alert-circle-outline', // security_alert
      2: 'swap-horizontal-outline', // transaction_alert
      3: 'cash-outline', // payment_confirmation
      4: 'cube-outline', // package_created
      5: 'cash-outline', // contribution
      6: 'log-in-outline', // login_alert
      7: 'lock-closed-outline', // password_reset
      8: 'calendar-outline', // scheduled_contribution
      9: 'wallet-outline', // withdrawal_request
      10: 'checkmark-circle-outline', // withdrawal_approved
    };
    return iconMap[type] || 'notifications-outline';
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`mx-4 mb-3 p-4 rounded-lg border ${
        item.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      }`}
      onPress={() => handleMarkAsRead(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            item.isRead ? 'bg-gray-100' : 'bg-blue-100'
          }`}
        >
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={item.isRead ? '#6B7280' : '#3B82F6'}
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text
              className={`flex-1 text-base ${
                item.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 ml-2">{formatDate(item.createdAt)}</Text>
          </View>

          {item.body && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {item.body}
            </Text>
          )}

          {/* Actions */}
          <View className="flex-row items-center justify-end mt-1">
            {!item.isRead && (
              <TouchableOpacity
                onPress={() => markAsReadMutation.mutate(item.id)}
                className="flex-row items-center mr-4"
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#3B82F6" />
                <Text className="text-xs text-blue-600 ml-1">Mark as read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleDeleteNotification(item.id)}
              className="flex-row items-center"
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text className="text-xs text-red-500 ml-1">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-700 mt-4">No Notifications</Text>
      <Text className="text-gray-500 text-center mt-2">
        You&apos;re all caught up! We&apos;ll notify you when something important happens.
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-xl font-semibold text-gray-700 mt-4">Failed to Load</Text>
      <Text className="text-gray-500 text-center mt-2">
        {(error as any)?.message || 'Unable to load notifications'}
      </Text>
      <TouchableOpacity
        onPress={() => refetch()}
        className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !notificationsData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderError()}
      </SafeAreaView>
    );
  }

  const notifications = notificationsData?.results || [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
        {hasUnread && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="px-3 py-1.5 bg-blue-600 rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#3B82F6']} />
        }
        onEndReached={() => {
          if (
            notificationsData &&
            notificationsData.page < notificationsData.totalPages &&
            !isLoading
          ) {
            setPage((prev) => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}