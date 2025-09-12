/**
 * SureBank Authentication Hooks
 * 
 * Centralized export for all authentication-related hooks
 */

// TanStack Query hooks
export {
  useLoginMutation,
  useRegisterMutation,
  useVerifyAccountMutation,
  useResendVerificationMutation,
  usePasswordResetMutation,
  useVerifyResetCodeMutation,
  useNewPasswordMutation,
  useLogoutMutation,
  useRefreshUserMutation,
  useAuthMutations,
  useAuthMutationsLoading,
  AUTH_QUERY_KEYS,
} from './useAuthMutations';

export {
  useCurrentUserQuery,
  useAuthStatusQuery,
  useTokenInfoQuery,
  useAuthValidationQuery,
  useAuthQueries,
  usePrefetchUserData,
  useInvalidateAuthQueries,
  useCachedAuthData,
} from './useAuthQueries';

// Context hooks (re-export from contexts)
export {
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useAuthActions,
} from '@/contexts/AuthContext';

export {
  usePinSecurity,
  useIsLocked,
  usePinActions,
} from '@/contexts/PinSecurityContext';