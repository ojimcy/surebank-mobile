import Constants from 'expo-constants';

interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  wsBaseUrl: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  nodeEnv: 'development' | 'production' | 'test';
  appEnv: 'development' | 'staging' | 'production';
  
  // Feature Flags
  enableMockData: boolean;
  enableWebsockets: boolean;
  enablePushNotifications: boolean;
  
  // Debug Flags
  debugApiCalls: boolean;
  debugWebsockets: boolean;
  
  // Firebase Configuration
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  
  // Firebase Emulator
  useFirebaseEmulator: boolean;
}

const extra = Constants.expoConfig?.extra || {};

export const ENV: AppConfig = {
  // API Configuration
  apiBaseUrl: extra.apiBaseUrl || 'https://api.xpattrada.com',
  wsBaseUrl: extra.wsBaseUrl || 'wss://ws.xpattrada.com',
  
  // App Configuration
  appName: extra.appName || 'XpatTrada',
  appVersion: extra.appVersion || '1.0.0',
  nodeEnv: extra.nodeEnv || 'development',
  appEnv: extra.appEnv || 'development',
  
  // Feature Flags
  enableMockData: extra.enableMockData || false,
  enableWebsockets: extra.enableWebsockets !== false,
  enablePushNotifications: extra.enablePushNotifications !== false,
  
  // Debug Flags
  debugApiCalls: extra.debugApiCalls || false,
  debugWebsockets: extra.debugWebsockets || false,
  
  // Firebase Configuration
  firebase: {
    apiKey: extra.firebase?.apiKey,
    authDomain: extra.firebase?.authDomain,
    projectId: extra.firebase?.projectId,
    storageBucket: extra.firebase?.storageBucket,
    messagingSenderId: extra.firebase?.messagingSenderId,
    appId: extra.firebase?.appId,
  },
  
  // Firebase Emulator
  useFirebaseEmulator: extra.useFirebaseEmulator || false,
};

// Helper functions
export const isDevelopment = () => ENV.nodeEnv === 'development';
export const isProduction = () => ENV.nodeEnv === 'production';
export const isTest = () => ENV.nodeEnv === 'test';

// Validation function to ensure required environment variables are set
export const validateEnv = (): boolean => {
  const required = [
    'apiBaseUrl',
    'wsBaseUrl',
    'appName',
    'appVersion'
  ];
  
  const missing = required.filter(key => !ENV[key as keyof AppConfig]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

// Export individual config sections for easier access
export const API_CONFIG = {
  baseUrl: ENV.apiBaseUrl,
  wsBaseUrl: ENV.wsBaseUrl,
  timeout: 30000, // 30 seconds
} as const;

export const FIREBASE_CONFIG = ENV.firebase;

export const FEATURE_FLAGS = {
  mockData: ENV.enableMockData,
  websockets: ENV.enableWebsockets,
  pushNotifications: ENV.enablePushNotifications,
} as const;

export const DEBUG_FLAGS = {
  apiCalls: ENV.debugApiCalls,
  websockets: ENV.debugWebsockets,
} as const;