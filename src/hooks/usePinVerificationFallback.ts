/**
 * Fallback PIN Verification Hook
 *
 * Temporary implementation until proper PIN security is set up.
 */

export function usePinVerification() {
  const verifyPin = async (options?: { title?: string; description?: string }) => {
    // For now, just return true to allow the action
    // TODO: Implement proper PIN verification with PinSecurityProvider
    console.log('PIN verification requested:', options);
    return true;
  };

  return { verifyPin };
}