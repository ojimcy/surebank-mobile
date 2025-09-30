/**
 * SureBank Notifications API
 *
 * Service for managing user notifications including fetching,
 * marking as read, and getting unread count.
 */

import apiClient from './client';

// Notification Types
export type NotificationRelatedEntityType =
  | 'transaction'
  | 'account'
  | 'user'
  | 'package'
  | 'withdrawal'
  | 'contribution'
  | 'interest_package'
  | 'daily_savings'
  | 'sb_package';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: number;
  image?: string;
  url?: string;
  reference?: string;
  relatedEntityId?: string;
  relatedEntityType?: NotificationRelatedEntityType;
  isRead: boolean;
  isDeleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  results: Notification[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface NotificationCountResponse {
  count: number;
}

// Notification preference types
export type NotificationChannel = 'email' | 'sms' | 'both' | 'none';

export interface NotificationPreferences {
  id: string;
  userId: string;
  preferences: Record<string, NotificationChannel>;
  unsubscribedFromAll: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTypesResponse {
  types: string[];
  channels: string[];
}

/**
 * Notification service methods
 */
const notificationsService = {
  /**
   * Get all notifications for the current user
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<NotificationsResponse>
   */
  getNotifications: async (params?: {
    type?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<NotificationsResponse> => {
    const response = await apiClient.get<NotificationsResponse>('/notifications/all', {
      params: {
        limit: 20,
        sortBy: 'createdAt:desc',
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Get count of unread notifications
   * @returns Promise<number>
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<NotificationCountResponse>('/notifications/count');
    return response.data.count;
  },

  /**
   * Mark a notification as read
   * @param notificationId - ID of the notification to mark as read
   * @returns Promise<Notification>
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.post<Notification>(
      `/notifications/${notificationId}/mark-as-read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns Promise<void>
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Delete a notification
   * @param notificationId - ID of the notification to delete
   * @returns Promise<Notification>
   */
  deleteNotification: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.delete<Notification>(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get user notification preferences
   * @returns Promise<NotificationPreferences>
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  /**
   * Update user notification preferences
   * @param preferences - Updated preferences object
   * @returns Promise<NotificationPreferences>
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const response = await apiClient.put<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );
    return response.data;
  },

  /**
   * Get available notification types and channels
   * @returns Promise<NotificationTypesResponse>
   */
  getNotificationTypes: async (): Promise<NotificationTypesResponse> => {
    const response = await apiClient.get<NotificationTypesResponse>('/notifications/types');
    return response.data;
  },

  /**
   * Unsubscribe from all notifications
   * @returns Promise<NotificationPreferences>
   */
  unsubscribeFromAll: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.post<NotificationPreferences>('/notifications/unsubscribe');
    return response.data;
  },

  /**
   * Unsubscribe from a specific notification type
   * @param type - Notification type to unsubscribe from
   * @returns Promise<NotificationPreferences>
   */
  unsubscribeFromType: async (type: string): Promise<NotificationPreferences> => {
    const response = await apiClient.post<NotificationPreferences>(
      `/notifications/unsubscribe/${type}`
    );
    return response.data;
  },
};

export default notificationsService;