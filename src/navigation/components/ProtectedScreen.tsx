/**
 * SureBank Protected Screen HOC
 * 
 * Higher-order component that wraps screens with security guards
 * and activity tracking.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthGuard, PinGuard, RoleGuard, UserRole } from '../guards';
import { withActivityTracking } from '@/components/security/ActivityTracker';
import { usePinVerification } from '@/components/security';

interface ProtectedScreenOptions {
  requireAuth?: boolean;
  requirePin?: boolean;
  allowedRoles?: UserRole[];
  pinTitle?: string;
  pinSubtitle?: string;
  trackActivity?: boolean;
}

interface ProtectedScreenProps {
  // Screen-specific props would go here
}

// Loading screen component
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0066A1" />
    </View>
  );
}

/**
 * Higher-order component for creating protected screens
 */
export function withProtectedScreen<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: ProtectedScreenOptions = {}
) {
  const {
    requireAuth = true,
    requirePin = false,
    allowedRoles,
    pinTitle = 'Enter PIN',
    pinSubtitle = 'Please enter your PIN to access this screen',
    trackActivity = true,
  } = options;

  const ProtectedScreen = (props: P & ProtectedScreenProps) => {
    // Wrap with activity tracking if enabled
    let Component = trackActivity 
      ? withActivityTracking(WrappedComponent)
      : WrappedComponent;

    let wrappedComponent = <Component {...props} />;

    // Apply role guard if specified
    if (allowedRoles && allowedRoles.length > 0) {
      wrappedComponent = (
        <RoleGuard allowedRoles={allowedRoles}>
          {wrappedComponent}
        </RoleGuard>
      );
    }

    // Apply PIN guard if required
    if (requirePin) {
      wrappedComponent = (
        <PinGuard 
          requirePin={true}
          title={pinTitle}
          subtitle={pinSubtitle}
        >
          {wrappedComponent}
        </PinGuard>
      );
    }

    // Apply auth guard if required
    if (requireAuth) {
      wrappedComponent = (
        <AuthGuard fallback={<LoadingScreen />}>
          {wrappedComponent}
        </AuthGuard>
      );
    }

    return wrappedComponent;
  };

  // Set display name for debugging
  ProtectedScreen.displayName = `withProtectedScreen(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedScreen;
}

/**
 * Pre-configured protected screen variants
 */

// Public screen (no protection)
export function withPublicScreen<P extends object>(Component: React.ComponentType<P>) {
  return withProtectedScreen(Component, { 
    requireAuth: false, 
    requirePin: false 
  });
}

// Authenticated screen (requires login)
export function withAuthenticatedScreen<P extends object>(Component: React.ComponentType<P>) {
  return withProtectedScreen(Component, { 
    requireAuth: true, 
    requirePin: false 
  });
}

// Secure screen (requires login + PIN)
export function withSecureScreen<P extends object>(Component: React.ComponentType<P>) {
  return withProtectedScreen(Component, { 
    requireAuth: true, 
    requirePin: true 
  });
}

// Admin screen (requires admin role)
export function withAdminScreen<P extends object>(Component: React.ComponentType<P>) {
  return withProtectedScreen(Component, { 
    requireAuth: true, 
    allowedRoles: ['admin'] 
  });
}

// Premium screen (requires premium or business role)
export function withPremiumScreen<P extends object>(Component: React.ComponentType<P>) {
  return withProtectedScreen(Component, { 
    requireAuth: true, 
    allowedRoles: ['premium', 'business', 'admin'] 
  });
}

/**
 * Hook for requesting PIN verification in components
 */
export function useScreenPinVerification() {
  const { verifyPin } = usePinVerification();

  return {
    requestPinVerification: verifyPin,
  };
}

export default withProtectedScreen;