/**
 * SureBank Security Provider
 * 
 * Comprehensive security provider that integrates PIN authentication,
 * biometric support, session management, and activity monitoring.
 */

import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { PinSecurityProvider } from '@/contexts/PinSecurityContext';
import PinAuthGuard from './PinAuthGuard';
import PinVerificationModal from './PinVerificationModal';
import ActivityTracker from './ActivityTracker';
import { useSession } from '@/hooks/useSession';

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * Inner security wrapper that uses hooks
 */
function SecurityWrapper({ children }: SecurityProviderProps) {
  const { trackActivity } = useSession();

  return (
    <ActivityTracker>
      <PinAuthGuard>
        <View style={{ flex: 1 }}>
          {children}
          <PinVerificationModal />
        </View>
      </PinAuthGuard>
    </ActivityTracker>
  );
}

/**
 * Complete security provider with all security contexts and guards
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  return (
    <AuthProvider>
      <PinSecurityProvider>
        <SecurityWrapper>
          {children}
        </SecurityWrapper>
      </PinSecurityProvider>
    </AuthProvider>
  );
}

export default SecurityProvider;