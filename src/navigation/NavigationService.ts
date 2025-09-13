/**
 * SureBank Navigation Service
 * 
 * Centralized navigation service for programmatic navigation
 * from services, contexts, and utilities.
 */

import { createNavigationContainerRef, StackActions, CommonActions } from '@react-navigation/native';

// Create navigation reference
export const navigationRef = createNavigationContainerRef();

/**
 * Navigation service for programmatic navigation
 */
class NavigationService {
  /**
   * Check if navigation is ready
   */
  isReady(): boolean {
    return navigationRef.isReady();
  }

  /**
   * Get current route name
   */
  getCurrentRoute(): string | undefined {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute()?.name;
    }
    return undefined;
  }

  /**
   * Navigate to a screen
   */
  navigate(name: string, params?: object): void {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as never, params as never);
    }
  }

  /**
   * Go back to previous screen
   */
  goBack(): void {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }

  /**
   * Reset navigation stack
   */
  reset(routeName: string, params?: object): void {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      });
    }
  }

  /**
   * Push a new screen onto the stack
   */
  push(name: string, params?: object): void {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  }

  /**
   * Pop screens from the stack
   */
  pop(count = 1): void {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.pop(count));
    }
  }

  /**
   * Pop to the top of the stack
   */
  popToTop(): void {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.popToTop());
    }
  }

  /**
   * Replace current screen
   */
  replace(name: string, params?: object): void {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  }

  // Authentication-specific navigation methods

  /**
   * Navigate to login screen
   */
  navigateToLogin(): void {
    this.reset('Auth', { screen: 'Authentication', params: { initialTab: 'login' } });
  }

  /**
   * Navigate to registration screen
   */
  navigateToRegister(): void {
    this.reset('Auth', { screen: 'Authentication', params: { initialTab: 'register' } });
  }

  /**
   * Navigate to main app (after successful authentication)
   */
  navigateToMain(): void {
    this.reset('Main', { screen: 'Dashboard' });
  }

  /**
   * Navigate to onboarding
   */
  navigateToOnboarding(): void {
    this.reset('Auth', { screen: 'Onboarding' });
  }

  /**
   * Navigate to PIN setup
   */
  navigateToPinSetup(): void {
    this.navigate('PINSetup');
  }

  /**
   * Navigate to verification screen
   */
  navigateToVerification(identifier: string): void {
    this.navigate('Verification', { identifier });
  }

  /**
   * Navigate to password recovery
   */
  navigateToPasswordRecovery(): void {
    this.navigate('PasswordRecovery');
  }

  // Main app navigation methods

  /**
   * Navigate to dashboard
   */
  navigateToDashboard(): void {
    this.navigate('Dashboard');
  }

  /**
   * Navigate to settings
   */
  navigateToSettings(): void {
    this.navigate('Settings');
  }

  /**
   * Navigate to profile
   */
  navigateToProfile(): void {
    this.navigate('Profile');
  }

  /**
   * Navigate to payments
   */
  navigateToPayments(): void {
    this.navigate('Payments');
  }

  /**
   * Navigate to transfer screen
   */
  navigateToTransfer(params?: object): void {
    this.navigate('Transfer', params);
  }

  /**
   * Navigate to transaction history
   */
  navigateToTransactionHistory(): void {
    this.navigate('TransactionHistory');
  }

  // Security-specific navigation

  /**
   * Navigate to security settings
   */
  navigateToSecuritySettings(): void {
    this.navigate('SecuritySettings');
  }

  /**
   * Show PIN lock screen
   */
  showPinLock(): void {
    // This would be handled by the PIN guard system
    console.log('PIN lock requested');
  }

  /**
   * Handle authentication expiry
   */
  handleAuthExpiry(reason = 'session_expired'): void {
    console.log('Authentication expired:', reason);
    this.navigateToLogin();
  }

  /**
   * Handle session warning
   */
  handleSessionWarning(): void {
    console.log('Session warning triggered');
    // Could show a modal or notification
  }
}

// Create singleton instance
const navigationService = new NavigationService();

export default navigationService;