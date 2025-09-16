/**
 * SureBank Authentication Guard
 *
 * Navigation guard that protects routes requiring authentication.
 * Note: Navigation logic should be handled at the navigator level, not here.
 */

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  fallback = null
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading or fallback while checking auth status
  if (isLoading) {
    return fallback as React.ReactElement;
  }

  // Show children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback if not authenticated
  // Navigation should be handled by the RootNavigator based on auth state
  return fallback as React.ReactElement;
}

export default AuthGuard;