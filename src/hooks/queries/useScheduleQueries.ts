/**
 * Schedule Queries Hook
 *
 * Manages scheduled contribution operations using TanStack Query.
 * Handles CRUD operations, state management, and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import scheduledContributionsApi, {
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '@/services/api/scheduledContributions';

// Query keys
const QUERY_KEYS = {
  schedules: ['schedules'],
  scheduleStats: ['scheduleStats'],
  schedule: (id: string) => ['schedule', id],
  paymentLogs: (id: string) => ['paymentLogs', id],
};

export function useScheduleQueries() {
  const queryClient = useQueryClient();

  // Show toast notifications
  const showSuccess = (message: string, description?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  const showError = (message: string, description?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  // Get user schedules query
  const {
    data: schedulesData,
    isLoading: isSchedulesLoading,
    isError: isSchedulesError,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: QUERY_KEYS.schedules,
    queryFn: async () => {
      const response = await scheduledContributionsApi.getUserSchedules();
      return response;
    },
  });

  // Get schedule stats query
  const {
    data: scheduleStats,
    isLoading: isScheduleStatsLoading,
    isError: isScheduleStatsError,
    error: scheduleStatsError,
    refetch: refetchScheduleStats,
  } = useQuery({
    queryKey: QUERY_KEYS.scheduleStats,
    queryFn: async () => {
      const stats = await scheduledContributionsApi.getScheduleStats();
      return stats;
    },
  });

  // Get specific schedule by ID
  const getSchedule = async (scheduleId: string) => {
    try {
      const schedule = await scheduledContributionsApi.getSchedule(scheduleId);
      return schedule;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Get schedule error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError(
        'Error fetching schedule',
        axiosError.response?.data?.message || 'Could not fetch the schedule details'
      );

      throw error;
    }
  };

  // Get payment logs for a schedule
  const getPaymentLogs = async (scheduleId: string, page: number = 1, limit: number = 10) => {
    try {
      const logs = await scheduledContributionsApi.getPaymentLogs(scheduleId, { page, limit });
      return logs;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Get payment logs error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError(
        'Error fetching payment logs',
        axiosError.response?.data?.message || 'Could not fetch the payment logs'
      );

      throw error;
    }
  };

  // Create schedule mutation
  const {
    mutate: createSchedule,
    mutateAsync: createScheduleAsync,
    isPending: isCreateScheduleLoading,
    isError: isCreateScheduleError,
  } = useMutation({
    mutationFn: async (payload: CreateSchedulePayload) => {
      try {
        const result = await scheduledContributionsApi.createSchedule(payload);
        return result;
      } catch (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleStats });
      showSuccess(
        'Schedule Created',
        'Your scheduled contribution has been created successfully'
      );
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Create schedule error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError(
        'Error creating schedule',
        axiosError.response?.data?.message || 'Could not create schedule. Please try again.'
      );
    },
  });

  // Update schedule mutation
  const {
    mutate: updateSchedule,
    mutateAsync: updateScheduleAsync,
    isPending: isUpdateScheduleLoading,
  } = useMutation({
    mutationFn: async ({
      scheduleId,
      payload,
    }: {
      scheduleId: string;
      payload: UpdateSchedulePayload;
    }) => {
      try {
        const result = await scheduledContributionsApi.updateSchedule(scheduleId, payload);
        return result;
      } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(variables.scheduleId) });
      showSuccess('Schedule Updated', 'Your schedule has been updated successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      showError(
        'Error updating schedule',
        axiosError.response?.data?.message || 'Could not update schedule. Please try again.'
      );
    },
  });

  // Pause schedule mutation
  const {
    mutate: pauseSchedule,
    mutateAsync: pauseScheduleAsync,
    isPending: isPauseScheduleLoading,
  } = useMutation({
    mutationFn: async (scheduleId: string) => {
      try {
        const result = await scheduledContributionsApi.pauseSchedule(scheduleId);
        return result;
      } catch (error) {
        console.error('Error pausing schedule:', error);
        throw error;
      }
    },
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
      showSuccess('Schedule Paused', 'Your schedule has been paused successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      showError(
        'Error pausing schedule',
        axiosError.response?.data?.message || 'Could not pause schedule. Please try again.'
      );
    },
  });

  // Resume schedule mutation
  const {
    mutate: resumeSchedule,
    mutateAsync: resumeScheduleAsync,
    isPending: isResumeScheduleLoading,
  } = useMutation({
    mutationFn: async (scheduleId: string) => {
      try {
        const result = await scheduledContributionsApi.resumeSchedule(scheduleId);
        return result;
      } catch (error) {
        console.error('Error resuming schedule:', error);
        throw error;
      }
    },
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
      showSuccess('Schedule Resumed', 'Your schedule has been resumed successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      showError(
        'Error resuming schedule',
        axiosError.response?.data?.message || 'Could not resume schedule. Please try again.'
      );
    },
  });

  // Cancel schedule mutation
  const {
    mutate: cancelSchedule,
    mutateAsync: cancelScheduleAsync,
    isPending: isCancelScheduleLoading,
  } = useMutation({
    mutationFn: async (scheduleId: string) => {
      try {
        const result = await scheduledContributionsApi.cancelSchedule(scheduleId);
        return result;
      } catch (error) {
        console.error('Error cancelling schedule:', error);
        throw error;
      }
    },
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
      showSuccess('Schedule Cancelled', 'Your schedule has been cancelled successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      showError(
        'Error cancelling schedule',
        axiosError.response?.data?.message || 'Could not cancel schedule. Please try again.'
      );
    },
  });

  // Effect for handling query errors
  useEffect(() => {
    if (isSchedulesError && schedulesError) {
      const axiosError = schedulesError as AxiosError<{ message?: string }>;
      if (axiosError.response?.status !== 404) {
        console.error('Schedules query error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });

        showError(
          'Error fetching schedules',
          axiosError.response?.data?.message || 'Could not fetch your schedules'
        );
      }
    }
  }, [isSchedulesError, schedulesError]);

  useEffect(() => {
    if (isScheduleStatsError && scheduleStatsError) {
      const axiosError = scheduleStatsError as AxiosError<{ message?: string }>;
      if (axiosError.response?.status !== 404) {
        console.error('Schedule stats query error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });
      }
    }
  }, [isScheduleStatsError, scheduleStatsError]);

  return {
    // Schedules data
    schedules: schedulesData?.schedules || [],
    schedulesCount: schedulesData?.totalSchedules || 0,
    scheduleStats,
    hasSchedules: (schedulesData?.schedules || []).length > 0,

    // Action methods
    createSchedule,
    createScheduleAsync,
    updateSchedule,
    updateScheduleAsync,
    pauseSchedule,
    pauseScheduleAsync,
    resumeSchedule,
    resumeScheduleAsync,
    cancelSchedule,
    cancelScheduleAsync,
    getSchedule,
    getPaymentLogs,
    refetchSchedules,
    refetchScheduleStats,

    // Loading states
    isSchedulesLoading,
    isScheduleStatsLoading,
    isCreateScheduleLoading,
    isUpdateScheduleLoading,
    isPauseScheduleLoading,
    isResumeScheduleLoading,
    isCancelScheduleLoading,

    // Error states
    isSchedulesError,
    isScheduleStatsError,
    isCreateScheduleError,
  };
}

// Export individual query hooks for specific use cases
export function useScheduleQuery(scheduleId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schedule(scheduleId),
    queryFn: () => scheduledContributionsApi.getSchedule(scheduleId),
    enabled: !!scheduleId,
  });
}

export function usePaymentLogsQuery(
  scheduleId: string,
  options?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.paymentLogs(scheduleId), options],
    queryFn: () => scheduledContributionsApi.getPaymentLogs(scheduleId, options),
    enabled: !!scheduleId,
  });
}

export function usePauseScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) =>
      scheduledContributionsApi.pauseSchedule(scheduleId),
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
    },
  });
}

export function useResumeScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) =>
      scheduledContributionsApi.resumeSchedule(scheduleId),
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
    },
  });
}

export function useCancelScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) =>
      scheduledContributionsApi.cancelSchedule(scheduleId),
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
    },
  });
}

export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateSchedulePayload }) =>
      scheduledContributionsApi.updateSchedule(scheduleId, data),
    onSuccess: (_, { scheduleId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(scheduleId) });
    },
  });
}