// Navigation components
export { default as RootNavigator } from './RootNavigator';
export { default as AuthStack } from './AuthStack';
export { default as MainTabs } from './MainTabs';
export { default as DashboardStack } from './DashboardStack';
export { default as TradingStack } from './TradingStack';
export { default as PortfolioStack } from './PortfolioStack';
export { default as HistoryStack } from './HistoryStack';
export { default as SettingsStack } from './SettingsStack';

export * from './types';

// Navigation service
export { default as navigationService, navigationRef } from './NavigationService';

// Guards
export { AuthGuard, PinGuard, RoleGuard } from './guards';
export type { UserRole } from './guards';

// Protected screen components
export {
  withProtectedScreen,
  withPublicScreen,
  withAuthenticatedScreen,
  withSecureScreen,
  withAdminScreen,
  withPremiumScreen,
  useScreenPinVerification,
} from './components';