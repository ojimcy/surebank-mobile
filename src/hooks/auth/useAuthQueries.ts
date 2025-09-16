/**
 * SureBank Authentication Queries
 * 
 * TanStack Query hooks for fetching authentication data
 * with automatic caching, background updates, and error handling.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '@/services/api/auth';
import tokenManager from '@/services/auth/tokenManager';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_QUERY_KEYS } from './useAuthMutations';

/**
 * Query to get current user information
 */
export function useCurrentUserQuery(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.name === 'AuthenticationError') {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Query to get authentication status
 */
export function useAuthStatusQuery(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.status,
    queryFn: async () => {
      const isAuth = await tokenManager.isAuthenticated();
      return { isAuthenticated: isAuth };
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options?.gcTime ?? 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry status checks
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
  });
}

/**
 * Query to get token information
 */
export function useTokenInfoQuery(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.tokens,
    queryFn: () => tokenManager.getTokenInfo(),
    enabled: isAuthenticated && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 60 * 1000, // 1 minute
    gcTime: options?.gcTime ?? 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry token info
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes to track expiry
  });
}

/**
 * Query to check if authentication is still valid
 */
export function useAuthValidationQuery(options?: {
  enabled?: boolean;
  interval?: number;
}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.status, 'validation'],
    queryFn: async () => {
      try {
        // Try to get current user - will fail if token is invalid
        await authService.getCurrentUser();
        return { isValid: true, timestamp: new Date().toISOString() };
      } catch (error) {
        return { isValid: false, timestamp: new Date().toISOString(), error: (error as Error).message };
      }
    },
    enabled: isAuthenticated && (options?.enabled !== false),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: options?.interval ?? 5 * 60 * 1000, // Check every 5 minutes
  });
}

/**
 * Combined hook for all authentication queries
 */
export function useAuthQueries(options?: {
  enableUserQuery?: boolean;
  enableStatusQuery?: boolean;
  enableTokenQuery?: boolean;
  enableValidationQuery?: boolean;
}) {
  const userQuery = useCurrentUserQuery({
    enabled: options?.enableUserQuery
  });

  const statusQuery = useAuthStatusQuery({
    enabled: options?.enableStatusQuery
  });

  const tokenQuery = useTokenInfoQuery({
    enabled: options?.enableTokenQuery
  });

  const validationQuery = useAuthValidationQuery({
    enabled: options?.enableValidationQuery
  });

  return {
    user: userQuery,
    status: statusQuery,
    tokens: tokenQuery,
    validation: validationQuery,

    // Convenience flags
    isLoading: userQuery.isLoading || statusQuery.isLoading,
    isError: userQuery.isError || statusQuery.isError,
    error: userQuery.error || statusQuery.error,

    // Data
    userData: userQuery.data,
    statusData: statusQuery.data,
    tokenData: tokenQuery.data,
    validationData: validationQuery.data,
  };
}

/**
 * Hook to prefetch user data (useful for preloading)
 */
export function usePrefetchUserData() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const prefetchUser = async () => {
    if (!isAuthenticated) return;

    await queryClient.prefetchQuery({
      queryKey: AUTH_QUERY_KEYS.user,
      queryFn: () => authService.getCurrentUser(),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchUser };
}

/**
 * Hook to invalidate all authentication queries
 */
export function useInvalidateAuthQueries() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  };

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
  };

  const invalidateStatus = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.status });
  };

  const invalidateTokens = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.tokens });
  };

  return {
    invalidateAll,
    invalidateUser,
    invalidateStatus,
    invalidateTokens,
  };
}

/**
 * Hook to get cached authentication data
 */
export function useCachedAuthData() {
  const queryClient = useQueryClient();

  const getCachedUser = () => {
    return queryClient.getQueryData(AUTH_QUERY_KEYS.user);
  };

  const getCachedStatus = () => {
    return queryClient.getQueryData(AUTH_QUERY_KEYS.status);
  };

  const getCachedTokens = () => {
    return queryClient.getQueryData(AUTH_QUERY_KEYS.tokens);
  };

  return {
    getCachedUser,
    getCachedStatus,
    getCachedTokens,
  };
}