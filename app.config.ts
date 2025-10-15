import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'Surebank Stores',
    slug: 'surebank-stores',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark', // Default to dark theme matching brand
    newArchEnabled: true,
    scheme: 'surebank',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1a2c4f', // Dark navy background matching brand
    },
    description:
      'Surebank Stores - Shop Smart, Save Smart. Your all-in-one marketplace for shopping quality products and building your savings. Buy what you need, save for what you want.',
    primaryColor: '#1a2c4f', // Navy blue brand color
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.surebankstores.app',
      buildNumber: '1',
      userInterfaceStyle: 'dark',
      infoPlist: {
        NSCameraUsageDescription:
          'Surebank Stores needs camera access for product photos and secure KYC identity verification',
        NSPhotoLibraryUsageDescription:
          'Surebank Stores needs photo library access to upload product photos and identity documents for KYC verification',
        NSFaceIDUsageDescription:
          'Surebank Stores uses Face ID to securely authenticate your identity and protect your account',
        NSLocationWhenInUseUsageDescription:
          'Surebank Stores may use your location to show nearby stores and delivery options',
        CFBundleDisplayName: 'Surebank Stores',
        UIRequiresFullScreen: false,
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a2c4f', // Navy blue background
        monochromeImage: './assets/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
      package: 'com.surebankstores.app',
      versionCode: 1,
      userInterfaceStyle: 'dark',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
      softwareKeyboardLayoutMode: 'pan',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      'expo-web-browser',
      [
        'expo-updates',
        {
          username: 'ojimcy', // Your Expo username from owner field
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            flipper: false,
          },
        },
      ],
    ],
    updates: {
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/0ecf345d-18da-42f8-912b-ecf509a4d85f',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    experiments: {
      typedRoutes: false,
    },
    extra: {
      // EAS project configuration
      eas: {
        projectId:
          process.env.EXPO_EAS_PROJECT_ID ||
          '0ecf345d-18da-42f8-912b-ecf509a4d85f',
      },

      // Environment variables will be accessible via expo-constants
      apiBaseUrl:
        process.env.EXPO_PUBLIC_API_BASE_URL || 'https://a5shket0i1.execute-api.us-east-1.amazonaws.com/v1',
      wsBaseUrl: process.env.EXPO_PUBLIC_WS_BASE_URL || 'wss://ws.surebankstores.ng',
      appName: process.env.EXPO_PUBLIC_APP_NAME || 'SureBank',
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',

      // Feature flags
      enableMockData: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
      enableWebsockets: process.env.EXPO_PUBLIC_ENABLE_WEBSOCKETS !== 'false',
      enablePushNotifications:
        process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false',

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
      useFirebaseEmulator:
        process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
    },
    owner: 'ojimcy',
  };
};