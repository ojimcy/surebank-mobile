import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'SureBank',
    slug: 'surebank-native',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic', // Support both light and dark themes
    newArchEnabled: true,
    scheme: 'surebank',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.surebank.app',
      buildNumber: '1',
      userInterfaceStyle: 'dark',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs access to camera to take photos for KYC verification',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images for KYC verification',
        NSFaceIDUsageDescription: 'This app uses Face ID for secure authentication'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      edgeToEdgeEnabled: true,
      package: 'com.surebank.app',
      versionCode: 1,
      userInterfaceStyle: 'dark',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT'
      ]
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true
          },
          ios: {
            flipper: false
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Environment variables will be accessible via expo-constants
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.surebank.com',
      wsBaseUrl: process.env.EXPO_PUBLIC_WS_BASE_URL || 'wss://ws.surebank.com',
      appName: process.env.EXPO_PUBLIC_APP_NAME || 'SureBank',
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
      
      // Feature flags
      enableMockData: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
      enableWebsockets: process.env.EXPO_PUBLIC_ENABLE_WEBSOCKETS !== 'false',
      enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false',
      
      // Debug flags
      debugApiCalls: process.env.EXPO_PUBLIC_DEBUG_API_CALLS === 'true',
      debugWebsockets: process.env.EXPO_PUBLIC_DEBUG_WEBSOCKETS === 'true',
      
      // Firebase config (will be set via environment variables)
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      
      // Use Firebase emulator in development
      useFirebaseEmulator: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    },
    owner: 'ojimcy'
  };
};