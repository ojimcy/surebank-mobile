/**
 * Fallback PIN Verification Hook
 *
 * Temporary implementation that provides basic PIN verification.
 * This will be replaced when PinSecurityContext is fully integrated.
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_STORAGE_KEY = '@surebank_user_pin_temp';
const PIN_LAST_VERIFY_KEY = '@surebank_pin_last_verify_temp';
const PIN_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function usePinVerification() {
  const verifyPin = async (options?: { title?: string; description?: string }): Promise<boolean> => {
    // Check if PIN was recently verified
    try {
      const lastVerifyTime = await AsyncStorage.getItem(PIN_LAST_VERIFY_KEY);
      if (lastVerifyTime) {
        const timeSinceVerify = Date.now() - parseInt(lastVerifyTime, 10);
        if (timeSinceVerify < PIN_TIMEOUT) {
          return true; // Recently verified, skip prompt
        }
      }
    } catch (error) {
      console.error('Error checking PIN verification time:', error);
    }

    // For development, show a simple confirmation dialog
    // In production, this should use the PinSecurityContext
    return new Promise((resolve) => {
      Alert.alert(
        options?.title || 'PIN Verification',
        options?.description || 'Enter your PIN to continue',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: 'Verify',
            onPress: async () => {
              // For now, accept any verification attempt
              // Store verification time
              try {
                await AsyncStorage.setItem(PIN_LAST_VERIFY_KEY, Date.now().toString());
              } catch (error) {
                console.error('Error storing PIN verification time:', error);
              }
              resolve(true);
            },
          },
        ]
      );
    });
  };

  return { verifyPin };
}