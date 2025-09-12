/**
 * SureBank Authentication Mutations
 * 
 * TanStack Query mutations for authentication operations
 * including login, register, verify, and password reset flows.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService, { AuthenticationError } from '@/services/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  LoginPayload,
  RegisterPayload,
  VerifyPayload,
  ResetPasswordPayload,
  VerifyResetCodePayload,
  NewPasswordPayload,
} from '@/services/api/types';

// Query keys for authentication
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  tokens: ['auth', 'tokens'] as const,
  status: ['auth', 'status'] as const,
} as const;

/**
 * Login mutation hook
 */
export function useLoginMutation() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await login(payload);
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.status });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.tokens });
    },
    onError: (error: AuthenticationError) => {
      console.error('Login mutation failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegisterMutation() {
  const { register } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.status });
    },
    onError: (error: AuthenticationError) => {
      console.error('Registration mutation failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Account verification mutation hook
 */
export function useVerifyAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyPayload) => authService.verifyAccount(payload),
    onSuccess: () => {
      // Invalidate user data after verification
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.status });
    },
    onError: (error: AuthenticationError) => {
      console.error('Account verification failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Resend verification mutation hook
 */
export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (identifier: string) => authService.resendVerification(identifier),
    onError: (error: AuthenticationError) => {
      console.error('Resend verification failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error instanceof AuthenticationError && error.code === 'RATE_LIMITED') {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Password reset request mutation hook
 */
export function usePasswordResetMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.requestPasswordReset(payload),
    onError: (error: AuthenticationError) => {
      console.error('Password reset request failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on rate limit or not found errors
      if (error instanceof AuthenticationError && 
          (error.code === 'RATE_LIMITED' || error.code === 'EMAIL_NOT_FOUND')) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Verify reset code mutation hook
 */
export function useVerifyResetCodeMutation() {
  return useMutation({
    mutationFn: (payload: VerifyResetCodePayload) => authService.verifyResetCode(payload),
    onError: (error: AuthenticationError) => {
      console.error('Reset code verification failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * New password mutation hook
 */
export function useNewPasswordMutation() {
  return useMutation({
    mutationFn: (payload: NewPasswordPayload) => authService.resetPassword(payload),
    onError: (error: AuthenticationError) => {
      console.error('Password reset failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Logout mutation hook
 */
export function useLogoutMutation() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
      return { success: true };
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: (error: AuthenticationError) => {
      console.error('Logout failed:', error);
      // Even if server logout fails, clear local queries
      queryClient.clear();
    },
    retry: false, // Don't retry logout
  });
}

/**
 * Refresh user mutation hook
 */
export function useRefreshUserMutation() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await refreshUser();
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate user data after refresh
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error: AuthenticationError) => {
      console.error('User refresh failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on token expired errors
      if (error instanceof AuthenticationError && error.type === 'TOKEN_EXPIRED') {
        return false;
      }
      return failureCount < 1;
    },
  });
}

// Compound hook for all authentication mutations
export function useAuthMutations() {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const verifyAccountMutation = useVerifyAccountMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  const passwordResetMutation = usePasswordResetMutation();
  const verifyResetCodeMutation = useVerifyResetCodeMutation();
  const newPasswordMutation = useNewPasswordMutation();
  const logoutMutation = useLogoutMutation();
  const refreshUserMutation = useRefreshUserMutation();

  return {
    login: loginMutation,
    register: registerMutation,
    verifyAccount: verifyAccountMutation,
    resendVerification: resendVerificationMutation,
    passwordReset: passwordResetMutation,
    verifyResetCode: verifyResetCodeMutation,
    newPassword: newPasswordMutation,
    logout: logoutMutation,
    refreshUser: refreshUserMutation,
  };
}

// Helper hook to check if any auth mutation is loading
export function useAuthMutationsLoading() {
  const mutations = useAuthMutations();

  return {
    isLoading: Object.values(mutations).some(mutation => mutation.isPending),
    mutations,
  };
}