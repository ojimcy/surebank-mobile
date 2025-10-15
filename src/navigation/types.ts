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
  VerifyResetCode: { email: string };
  ResetPassword: { email: string; code: string };
  Welcome: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  StoreTab: NavigatorScreenParams<StoreStackParamList>;
  PackageTab: NavigatorScreenParams<PackageStackParamList>;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
};

// Store Stack
export type StoreStackParamList = {
  StoreHome: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
  Overview: undefined;
  Analytics: undefined;
  Notifications: undefined;
  MarketOverview: undefined;
  Withdraw: undefined;
  Deposit: { accountType?: 'ds' | 'ib' | 'sb'; packageId?: string } | undefined;
  TransactionHistory: undefined;
  TransactionDetail: { transactionId: string };
  CardsList: undefined;
  AddCard: undefined;
  SchedulesList: undefined;
  CreateSchedule: undefined;
  ScheduleDetail: { scheduleId: string };
  EditSchedule: { scheduleId: string };
};


// Payments Stack (used within Dashboard)
export type PaymentsStackParamList = {
  Withdraw: undefined;
  Deposit: { accountType?: 'ds' | 'ib' | 'sb'; packageId?: string } | undefined;
  TransferFunds: undefined;
  PaymentMethods: undefined;
};

// Package Stack
export type PackageStackParamList = {
  PackageHome: undefined;
  NewPackage: undefined;
  PackageDetail: { packageId: string; packageType: 'DS' | 'IBS' | 'SB' };
  CreateDailySavings: undefined;
  CreateIBSPackage: undefined;
  CreateSBPackage: { productId?: string } | undefined;
  Deposit: { accountType?: 'ds' | 'ib' | 'sb'; packageId?: string } | undefined;
  Withdraw: undefined;
  Assets: undefined;
  Performance: undefined;
  Positions: undefined;
  AssetDetails: { symbol: string };
};

// History Stack
export type HistoryStackParamList = {
  HistoryHome: undefined;
  Transactions: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { transactionId: string };
  Trades: undefined;
  Orders: undefined;
  Reports: undefined;
};

// Products Stack
export type ProductsStackParamList = {
  ProductsHome: { category?: string } | undefined;
  ProductDetail: { productId: string };
  CreateSBPackage: { productId?: string } | undefined;
};

// Settings Stack (Account Tab)
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
  KYCVerification: undefined;
  KYCIdVerification: undefined;
  KYCSuccess: undefined;
  Theme: undefined;
  Help: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
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
  // Payment result screens
  PaymentSuccess: { reference: string; amount?: number; packageType?: string };
  PaymentError: { reference?: string; error?: string };
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

export type StoreScreenProps<Screen extends keyof StoreStackParamList> = StackScreenProps<
  StoreStackParamList,
  Screen
>;

export type DashboardScreenProps<Screen extends keyof DashboardStackParamList> = StackScreenProps<
  DashboardStackParamList,
  Screen
>;

export type PackageScreenProps<Screen extends keyof PackageStackParamList> = StackScreenProps<
  PackageStackParamList,
  Screen
>;

export type HistoryScreenProps<Screen extends keyof HistoryStackParamList> = StackScreenProps<
  HistoryStackParamList,
  Screen
>;

export type ProductsScreenProps<Screen extends keyof ProductsStackParamList> = StackScreenProps<
  ProductsStackParamList,
  Screen
>;

export type SettingsScreenProps<Screen extends keyof SettingsStackParamList> = StackScreenProps<
  SettingsStackParamList,
  Screen
>;

export type CardsScreenProps<Screen extends keyof DashboardStackParamList> = StackScreenProps<
  DashboardStackParamList,
  Screen
>;

export type RootScreenProps<Screen extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  Screen
>;

// Navigation props types
export type AuthStackNavigationProp<Screen extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  Screen
>['navigation'];

export type StoreStackNavigationProp<Screen extends keyof StoreStackParamList> = StackScreenProps<
  StoreStackParamList,
  Screen
>['navigation'];

export type DashboardStackNavigationProp<Screen extends keyof DashboardStackParamList> = StackScreenProps<
  DashboardStackParamList,
  Screen
>['navigation'];

export type PackageStackNavigationProp<Screen extends keyof PackageStackParamList> = StackScreenProps<
  PackageStackParamList,
  Screen
>['navigation'];

export type ProductsStackNavigationProp<Screen extends keyof ProductsStackParamList> = StackScreenProps<
  ProductsStackParamList,
  Screen
>['navigation'];

export type HistoryStackNavigationProp<Screen extends keyof HistoryStackParamList> = StackScreenProps<
  HistoryStackParamList,
  Screen
>['navigation'];

export type SettingsStackNavigationProp<Screen extends keyof SettingsStackParamList> = StackScreenProps<
  SettingsStackParamList,
  Screen
>['navigation'];

declare module '@react-navigation/native' {
  export type RootParamList = RootStackParamList;
}