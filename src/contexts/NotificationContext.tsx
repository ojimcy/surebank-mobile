/**
 * Notification Context
 * Manages notification state, badge count, and real-time polling
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import notificationsService from '@/services/api/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextValue {
  unreadCount: number;
  hasUnreadNotifications: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Fetch unread notification count
  const {
    data: unreadCount = 0,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: async () => {
      if (!isAuthenticated) return 0;
      try {
        return await notificationsService.getUnreadCount();
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
        return 0;
      }
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // When app comes to foreground, refetch notifications
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (isAuthenticated) {
          refetch();
        }
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, isAuthenticated, refetch]);

  // Invalidate and refetch when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      // Clear notification count when logged out
      queryClient.setQueryData(['notificationCount'], 0);
    }
  }, [isAuthenticated, refetch, queryClient]);

  const hasUnreadNotifications = unreadCount > 0;

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        hasUnreadNotifications,
        isLoading,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}