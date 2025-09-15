/**
 * SureBank Secure Storage Service
 * 
 * Provides secure storage abstraction for both regular data (AsyncStorage)
 * and sensitive data (SecureStore). Automatically determines which storage
 * method to use based on the sensitivity of the data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys configuration
export const STORAGE_KEYS = {
  // Sensitive keys - stored in SecureStore (encrypted)
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  PIN_HASH: 'pin_hash',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  CSRF_TOKEN: 'csrf_token',
  CSRF_SECRET: 'csrf_secret',
  
  // Non-sensitive keys - stored in AsyncStorage
  USER_PREFERENCES: 'user_preferences',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_LOGIN: 'last_login',
  LAST_BACKGROUND_TIME: 'last_background_time',
  INACTIVITY_TIMEOUT: 'inactivity_timeout',
  REMEMBER_ME: 'remember_me',
  PUSH_NOTIFICATIONS_ENABLED: 'push_notifications_enabled',
  PIN_LENGTH: 'pin_length',
  FAILED_PIN_ATTEMPTS: 'failed_pin_attempts',
  SESSION_START_TIME: 'session_start_time',
  SESSION_ID: 'session_id',
  LAST_ACTIVITY: 'last_activity',
} as const;

// Sensitive keys that should be stored in SecureStore
const SENSITIVE_KEYS = new Set([
  STORAGE_KEYS.AUTH_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.PIN_HASH,
  STORAGE_KEYS.BIOMETRIC_ENABLED,
  STORAGE_KEYS.CSRF_TOKEN,
  STORAGE_KEYS.CSRF_SECRET,
]);

// Storage service interface
interface StorageService {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<Array<[string, string | null]>>;
  multiSet(keyValuePairs: Array<[string, string]>): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

// Error types for storage operations
export class StorageError extends Error {
  constructor(
    message: string,
    public operation: string,
    public key?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Storage service implementation
class SureStorageService implements StorageService {
  /**
   * Determines if a key should be stored securely
   */
  private isSensitiveKey(key: string): boolean {
    return SENSITIVE_KEYS.has(key);
  }

  /**
   * Store a value with automatic security level detection
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isSensitiveKey(key)) {
        await SecureStore.setItemAsync(key, value, {
          keychainService: 'SureBank',
          requireAuthentication: false, // We handle our own auth
        });
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to store item for key: ${key}`,
        'setItem',
        key,
        error as Error
      );
    }
  }

  /**
   * Retrieve a value with automatic security level detection
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isSensitiveKey(key)) {
        return await SecureStore.getItemAsync(key, {
          keychainService: 'SureBank',
        });
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to retrieve item for key: ${key}`,
        'getItem',
        key,
        error as Error
      );
    }
  }

  /**
   * Remove a value with automatic security level detection
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isSensitiveKey(key)) {
        await SecureStore.deleteItemAsync(key, {
          keychainService: 'SureBank',
        });
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove item for key: ${key}`,
        'removeItem',
        key,
        error as Error
      );
    }
  }

  /**
   * Clear all storage (both secure and regular)
   * WARNING: This will remove all app data
   */
  async clear(): Promise<void> {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Clear all sensitive keys from SecureStore
      for (const key of SENSITIVE_KEYS) {
        try {
          await SecureStore.deleteItemAsync(key, {
            keychainService: 'SureBank',
          });
        } catch (error) {
          // Key might not exist, continue with others
          console.warn(`Failed to clear secure key: ${key}`, error);
        }
      }
    } catch (error) {
      throw new StorageError(
        'Failed to clear all storage',
        'clear',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Get all keys from AsyncStorage (excludes secure keys for security)
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new StorageError(
        'Failed to get all keys',
        'getAllKeys',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Get multiple values at once
   */
  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      const results: Array<[string, string | null]> = [];
      
      // Separate sensitive and non-sensitive keys
      const sensitiveKeys = keys.filter(key => this.isSensitiveKey(key));
      const regularKeys = keys.filter(key => !this.isSensitiveKey(key));
      
      // Get regular keys from AsyncStorage
      if (regularKeys.length > 0) {
        const regularResults = await AsyncStorage.multiGet(regularKeys);
        results.push(...regularResults);
      }
      
      // Get sensitive keys from SecureStore one by one
      for (const key of sensitiveKeys) {
        const value = await this.getItem(key);
        results.push([key, value]);
      }
      
      return results;
    } catch (error) {
      throw new StorageError(
        'Failed to get multiple items',
        'multiGet',
        keys.join(', '),
        error as Error
      );
    }
  }

  /**
   * Set multiple values at once
   */
  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      // Separate sensitive and non-sensitive pairs
      const sensitivePairs = keyValuePairs.filter(([key]) => this.isSensitiveKey(key));
      const regularPairs = keyValuePairs.filter(([key]) => !this.isSensitiveKey(key));
      
      // Set regular pairs in AsyncStorage
      if (regularPairs.length > 0) {
        await AsyncStorage.multiSet(regularPairs);
      }
      
      // Set sensitive pairs in SecureStore one by one
      for (const [key, value] of sensitivePairs) {
        await this.setItem(key, value);
      }
    } catch (error) {
      throw new StorageError(
        'Failed to set multiple items',
        'multiSet',
        keyValuePairs.map(([key]) => key).join(', '),
        error as Error
      );
    }
  }

  /**
   * Remove multiple values at once
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      // Separate sensitive and non-sensitive keys
      const sensitiveKeys = keys.filter(key => this.isSensitiveKey(key));
      const regularKeys = keys.filter(key => !this.isSensitiveKey(key));
      
      // Remove regular keys from AsyncStorage
      if (regularKeys.length > 0) {
        await AsyncStorage.multiRemove(regularKeys);
      }
      
      // Remove sensitive keys from SecureStore one by one
      for (const key of sensitiveKeys) {
        await this.removeItem(key);
      }
    } catch (error) {
      throw new StorageError(
        'Failed to remove multiple items',
        'multiRemove',
        keys.join(', '),
        error as Error
      );
    }
  }
}

// Utility functions for common storage operations
export const storageUtils = {
  /**
   * Store JSON data
   */
  setJSON: async <T>(key: string, data: T): Promise<void> => {
    await storage.setItem(key, JSON.stringify(data));
  },

  /**
   * Retrieve and parse JSON data
   */
  getJSON: async <T>(key: string): Promise<T | null> => {
    const value = await storage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Check if a key exists
   */
  hasKey: async (key: string): Promise<boolean> => {
    const value = await storage.getItem(key);
    return value !== null;
  },

  /**
   * Get storage size (AsyncStorage only)
   */
  getStorageSize: async (): Promise<number> => {
    try {
      const keys = await storage.getAllKeys();
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      for (const [key, value] of keyValuePairs) {
        totalSize += key.length + (value?.length || 0);
      }
      
      return totalSize;
    } catch (error) {
      console.warn('Failed to calculate storage size:', error);
      return 0;
    }
  },

  /**
   * Clear all authentication-related data
   */
  clearAuthData: async (): Promise<void> => {
    const authKeys = [
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.CSRF_TOKEN,
      STORAGE_KEYS.CSRF_SECRET,
      STORAGE_KEYS.REMEMBER_ME,
      STORAGE_KEYS.LAST_LOGIN,
    ];
    
    await storage.multiRemove(authKeys);
  },

  /**
   * Clear all user-specific data (keeps app preferences)
   */
  clearUserData: async (): Promise<void> => {
    const userKeys = [
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.PIN_HASH,
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      STORAGE_KEYS.CSRF_TOKEN,
      STORAGE_KEYS.CSRF_SECRET,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.REMEMBER_ME,
      STORAGE_KEYS.LAST_LOGIN,
    ];
    
    await storage.multiRemove(userKeys);
  },
};

// Create and export storage instance
export const storage = new SureStorageService();
export default storage;