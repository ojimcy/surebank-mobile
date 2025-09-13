/**
 * SureBank PIN Verification Hook
 * 
 * React hook for PIN verification in components
 */

import React from 'react';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import pinVerificationService, { 
  PinVerificationOptions, 
  PinVerificationResult 
} from '@/services/security/PinVerificationService';

export function usePinVerification() {
  const pinSecurity = usePinSecurity();

  const verifyPin = React.useCallback(
    async (options?: PinVerificationOptions): Promise<PinVerificationResult> => {
      // If PIN is not set, return success (no PIN protection)
      if (!pinSecurity.isPinSet) {
        return { success: true };
      }

      // If app is currently locked, reject
      if (pinSecurity.isLocked) {
        return { 
          success: false, 
          error: 'App is currently locked. Please unlock first.' 
        };
      }

      try {
        return await pinVerificationService.verifyPin(options);
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'PIN verification failed' 
        };
      }
    },
    [pinSecurity.isPinSet, pinSecurity.isLocked]
  );

  const verifyForPayment = React.useCallback(
    (amount?: string) => verifyPin({
      title: 'Confirm Payment',
      subtitle: amount 
        ? `Enter PIN to confirm payment of ${amount}`
        : 'Enter PIN to confirm this payment',
      reason: 'payment_confirmation',
    }),
    [verifyPin]
  );

  const verifyForTransfer = React.useCallback(
    (amount?: string, recipient?: string) => verifyPin({
      title: 'Confirm Transfer',
      subtitle: amount && recipient
        ? `Enter PIN to transfer ${amount} to ${recipient}`
        : 'Enter PIN to confirm this transfer',
      reason: 'transfer_confirmation',
    }),
    [verifyPin]
  );

  const verifyForSettings = React.useCallback(
    () => verifyPin({
      title: 'Verify Identity',
      subtitle: 'Enter PIN to access security settings',
      reason: 'settings_access',
    }),
    [verifyPin]
  );

  return {
    verifyPin,
    verifyForPayment,
    verifyForTransfer,
    verifyForSettings,
  };
}

export default usePinVerification;