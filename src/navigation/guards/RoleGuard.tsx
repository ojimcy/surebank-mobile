/**
 * SureBank Role Guard
 * 
 * Navigation guard that protects routes based on user roles and permissions.
 * Shows unauthorized screen or redirects users without proper access.
 */

import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from '@/contexts/AuthContext';
import { OutlineButton } from '@/components/forms';
import { useNavigation } from '@react-navigation/native';

// Define user roles
export type UserRole = 'user' | 'premium' | 'business' | 'admin';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo = 'Dashboard'
}: RoleGuardProps) {
  const user = useCurrentUser();
  const navigation = useNavigation();

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

      <OutlineButton
        title="Go Back"
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate(redirectTo as never);
          }
        }}
        leftIcon="arrow-back-outline"
      />
    </View>
  );
}

export default RoleGuard;