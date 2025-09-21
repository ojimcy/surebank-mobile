// Navigation components
export { default as RootNavigator } from './RootNavigator';
export { default as AuthStack } from './AuthStack';
export { default as MainTabs } from './MainTabs';
export { default as DashboardStack } from './DashboardStack';
export { default as PackageStack } from './PackageStack';
export { default as HistoryStack } from './HistoryStack';
export { default as SettingsStack } from './SettingsStack';

export * from './types';

// Navigation service
export { default as navigationService, navigationRef } from './NavigationService';
