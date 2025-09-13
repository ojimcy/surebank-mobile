/**
 * SureBank Authentication Guard
 * 
 * Navigation guard that protects routes requiring authentication.
 * Redirects unauthenticated users to login screen.
 */

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback = null, 
  redirectTo = 'Auth' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Reset navigation stack and navigate to auth
      navigation.reset({
        index: 0,
        routes: [{ name: redirectTo as never }],
      });
    }
  }, [isAuthenticated, isLoading, navigation, redirectTo]);

  // Show loading or fallback while checking auth status
  if (isLoading) {
    return fallback as React.ReactElement;
  }

  // Show children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback while redirecting
  return fallback as React.ReactElement;
}

export default AuthGuard;