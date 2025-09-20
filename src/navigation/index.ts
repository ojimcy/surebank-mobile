// Navigation components
export { default as RootNavigator } from './RootNavigator';
export { default as AuthStack } from './AuthStack';
export { default as MainTabs } from './MainTabs';
export { default as DashboardStack } from './DashboardStack';
export { default as TradingStack } from './TradingStack';
export { default as PackageStack } from './PackageStack';
export { default as HistoryStack } from './HistoryStack';
export { default as SettingsStack } from './SettingsStack';

export * from './types';

// Navigation service
export { default as navigationService, navigationRef } from './NavigationService';

// Guards - commented out to fix navigation context error
// These should only be imported where they're actually used, not exported globally
// export { AuthGuard, PinGuard, RoleGuard } from './guards';
// export type { UserRole } from './guards';

// Protected screen components - commented out to fix navigation context error
// These should only be imported where they're actually used, not exported globally
// export {
//   withProtectedScreen,
//   withPublicScreen,
//   withAuthenticatedScreen,
//   withSecureScreen,
//   withAdminScreen,
//   withPremiumScreen,
//   useScreenPinVerification,
// } from './components';