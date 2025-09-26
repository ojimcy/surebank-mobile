/**
 * Application Configuration
 */

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const Config = {
  // API Configuration
  API_BASE_URL: extra.apiBaseUrl || 'https://api.surebank.ng',
  WS_BASE_URL: extra.wsBaseUrl || 'wss://ws.surebank.ng',

  // App Configuration
  APP_NAME: extra.appName || 'SureBank',
  APP_VERSION: extra.appVersion || '1.0.0',
  NODE_ENV: extra.nodeEnv || 'development',
  APP_ENV: extra.appEnv || 'development',

  // Payment Configuration
  PAYSTACK_PUBLIC_KEY: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || extra.paystackPublicKey || '',
  PAYSTACK_SECRET_KEY: process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY || extra.paystackSecretKey || '',

  // Feature Flags
  ENABLE_MOCK_DATA: extra.enableMockData || false,
  ENABLE_WEBSOCKETS: extra.enableWebsockets !== false,
  ENABLE_PUSH_NOTIFICATIONS: extra.enablePushNotifications !== false,

  // Debug Flags
  DEBUG_API_CALLS: extra.debugApiCalls || false,
  DEBUG_WEBSOCKETS: extra.debugWebsockets || false,

  // Firebase Configuration
  FIREBASE: {
    API_KEY: extra.firebase?.apiKey,
    AUTH_DOMAIN: extra.firebase?.authDomain,
    PROJECT_ID: extra.firebase?.projectId,
    STORAGE_BUCKET: extra.firebase?.storageBucket,
    MESSAGING_SENDER_ID: extra.firebase?.messagingSenderId,
    APP_ID: extra.firebase?.appId,
  },

  // Firebase Emulator
  USE_FIREBASE_EMULATOR: extra.useFirebaseEmulator || false,
};

export default Config;