/**
 * SureBank PIN Verification Modal Component
 * 
 * React component to render PIN verification modal
 */

import React from 'react';
import { Modal } from 'react-native';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import PinLockScreen from '@/components/security/PinLockScreen';
import pinVerificationService from '@/services/security/PinVerificationService';

export function PinVerificationModal() {
  const [visible, setVisible] = React.useState(false);
  const pinSecurity = usePinSecurity();

  // Subscribe to service state changes
  React.useEffect(() => {
    const unsubscribe = pinVerificationService.onStateChange(() => {
      setVisible(pinVerificationService.isVisible);
    });

    return unsubscribe;
  }, []);

  if (!visible || !pinSecurity.isPinSet) {
    return null;
  }

  const options = pinVerificationService.currentOptions;
  const handlers = pinVerificationService.handlers;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent
    >
      <PinLockScreen
        title={options.title || 'Verify PIN'}
        subtitle={options.subtitle || 'Please enter your PIN to continue'}
        onSuccess={handlers.onSuccess}
        onCancel={options.allowCancel ? handlers.onCancel : undefined}
        allowBiometric={options.allowBiometric}
        testID="pin-verification-modal"
      />
    </Modal>
  );
}

export default PinVerificationModal;