import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Onboarding: undefined;
  Authentication: { initialTab?: 'login' | 'register' };
  Verification: { identifier: string };
  PasswordRecovery: undefined;
  PINSetup: undefined;
  Login: {
    message?: string;
    prefilledIdentifier?: string;
  } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Welcome: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  TradingTab: NavigatorScreenParams<TradingStackParamList>;
  PortfolioTab: NavigatorScreenParams<PortfolioStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
  Overview: undefined;
  Analytics: undefined;
  Notifications: undefined;
  MarketOverview: undefined;
};

// Trading Stack
export type TradingStackParamList = {
  TradingHome: undefined;
  BotManagement: undefined;
  CreateBot: undefined;
  EditBot: { botId: string };
  BotDetails: { botId: string };
};

// Portfolio Stack
export type PortfolioStackParamList = {
  PortfolioHome: undefined;
  NewPackage: undefined;
  PackageDetail: { packageId: string; packageType: 'DS' | 'IBS' | 'SB' };
  CreateDailySavings: undefined;
  CreateIBSPackage: undefined;
  CreateSBPackage: undefined;
  Assets: undefined;
  Performance: undefined;
  Positions: undefined;
  AssetDetails: { symbol: string };
};

// History Stack
export type HistoryStackParamList = {
  HistoryHome: undefined;
  Transactions: undefined;
  Trades: undefined;
  Orders: undefined;
  Reports: undefined;
};

// Settings Stack
export type SettingsStackParamList = {
  Settings: undefined;
  PersonalInformation: undefined;
  NotificationSettings: undefined;
  SecurityPin: undefined;
  ChangePassword: undefined;
  TwoFactorAuth: undefined;
  TransactionHistory: undefined;
  PaymentMethods: undefined;
  Statements: undefined;
  KycVerification: undefined;
  Help: undefined;
  About: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> & { hasCompletedOnboarding?: boolean };
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
  // Modal screens
  QRScanner: undefined;
  ImageViewer: { imageUri: string };
};

// Screen props types
export type AuthScreenProps<Screen extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  Screen
>;

export type MainTabScreenProps<Screen extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  Screen
>;

export type DashboardScreenProps<Screen extends keyof DashboardStackParamList> = StackScreenProps<
  DashboardStackParamList,
  Screen
>;

export type TradingScreenProps<Screen extends keyof TradingStackParamList> = StackScreenProps<
  TradingStackParamList,
  Screen
>;

export type PortfolioScreenProps<Screen extends keyof PortfolioStackParamList> = StackScreenProps<
  PortfolioStackParamList,
  Screen
>;

export type HistoryScreenProps<Screen extends keyof HistoryStackParamList> = StackScreenProps<
  HistoryStackParamList,
  Screen
>;

export type SettingsScreenProps<Screen extends keyof SettingsStackParamList> = StackScreenProps<
  SettingsStackParamList,
  Screen
>;

export type RootScreenProps<Screen extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  Screen
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}