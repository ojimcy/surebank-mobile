import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@surebank:onboarding_completed',
  AUTH_TOKEN: '@surebank:auth_token',
  USER_DATA: '@surebank:user_data',
  PIN_HASH: '@surebank:pin_hash',
  BIOMETRIC_ENABLED: '@surebank:biometric_enabled',
} as const;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};