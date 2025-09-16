/**
 * SureBank Role Guard
 *
 * Navigation guard that protects routes based on user roles and permissions.
 * Shows unauthorized screen when users don't have proper access.
 * Note: Navigation should be handled by parent components, not within guards.
 */

import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from '@/contexts/AuthContext';

// Define user roles
export type UserRole = 'user' | 'premium' | 'business' | 'admin';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback
}: RoleGuardProps) {
  const user = useCurrentUser();

  // Check if user has required role
  const hasRequiredRole = user && allowedRoles.includes(user.role as UserRole);

  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default unauthorized screen
  return (
    <View className="flex-1 justify-center items-center px-6 bg-white">
      <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="shield-outline" size={40} color="#dc2626" />
      </View>

      <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
        Access Restricted
      </Text>

      <Text className="text-gray-600 text-center leading-6 mb-8 max-w-sm">
        You don't have permission to access this feature.
        {allowedRoles.length === 1
          ? ` This requires ${allowedRoles[0]} access.`
          : ` This requires one of the following roles: ${allowedRoles.join(', ')}.`
        }
      </Text>

      <Text className="text-gray-500 text-sm text-center">
        Please contact support if you believe you should have access.
      </Text>
    </View>
  );
}

export default RoleGuard;