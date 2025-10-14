/**
 * SureBank Deep Linking Service
 * 
 * Handles deep links for password reset, account verification,
 * and other authentication flows.
 */

import { Linking, Alert } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import navigationService from '@/navigation/NavigationService';

// Deep link types
export type DeepLinkType =
  | 'password_reset'
  | 'email_verification'
  | 'account_activation'
  | 'payment_link'
  | 'payment_callback'
  | 'invite_link';

// Deep link data interface
export interface DeepLinkData {
  type: DeepLinkType;
  token?: string;
  email?: string;
  userId?: string;
  code?: string;
  expires?: string;
  [key: string]: any;
}

class DeepLinkingService {
  private pendingLink: DeepLinkData | null = null;
  private subscription: { remove: () => void } | null = null;

  /**
   * Initialize deep linking service
   */
  async initialize(): Promise<void> {
    try {
      // Check if app was opened with a deep link
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        this.handleDeepLink(initialURL);
      }

      // Listen for incoming deep links
      this.subscription = Linking.addEventListener('url', (event) => {
        this.handleDeepLink(event.url);
      });

      console.log('Deep linking service initialized');
    } catch (error) {
      console.error('Failed to initialize deep linking:', error);
    }
  }

  /**
   * Cleanup deep linking service
   */
  cleanup(): void {
    this.subscription?.remove();
    this.subscription = null;
  }

  /**
   * Handle incoming deep link
   */
  private handleDeepLink(url: string): void {
    try {
      const parsed = this.parseDeepLink(url);
      
      if (parsed) {
        console.log('Deep link received:', parsed);
        this.processDeepLink(parsed);
      } else {
        console.warn('Invalid deep link format:', url);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Parse deep link URL into structured data
   */
  private parseDeepLink(url: string): DeepLinkData | null {
    try {
      const parsed = ExpoLinking.parse(url);
      const { hostname, path, queryParams } = parsed;

      // Handle different deep link formats
      if (hostname === 'reset-password' || path?.includes('reset-password')) {
        return {
          type: 'password_reset',
          token: queryParams?.token as string,
          email: queryParams?.email as string,
          expires: queryParams?.expires as string,
        };
      }

      if (hostname === 'verify-email' || path?.includes('verify-email')) {
        return {
          type: 'email_verification',
          token: queryParams?.token as string,
          email: queryParams?.email as string,
          userId: queryParams?.userId as string,
        };
      }

      if (hostname === 'activate-account' || path?.includes('activate')) {
        return {
          type: 'account_activation',
          token: queryParams?.token as string,
          userId: queryParams?.userId as string,
        };
      }

      // Handle payment callback (after Paystack redirect)
      if (hostname === 'payment' && path?.includes('callback')) {
        const reference = queryParams?.reference || queryParams?.trxref as string;
        const status = queryParams?.status as string;
        const type = queryParams?.type as string;

        return {
          type: 'payment_callback',
          reference,
          status,
          packageType: type,
        };
      }

      // Handle payment link (payment request)
      if (hostname === 'payment' || path?.includes('payment')) {
        return {
          type: 'payment_link',
          token: queryParams?.token as string,
          amount: queryParams?.amount as string,
          recipient: queryParams?.recipient as string,
        };
      }

      if (hostname === 'invite' || path?.includes('invite')) {
        return {
          type: 'invite_link',
          token: queryParams?.token as string,
          inviterId: queryParams?.inviter as string,
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  /**
   * Process parsed deep link data
   */
  private processDeepLink(data: DeepLinkData): void {
    switch (data.type) {
      case 'password_reset':
        this.handlePasswordReset(data);
        break;

      case 'email_verification':
        this.handleEmailVerification(data);
        break;

      case 'account_activation':
        this.handleAccountActivation(data);
        break;

      case 'payment_callback':
        this.handlePaymentCallback(data);
        break;

      case 'payment_link':
        this.handlePaymentLink(data);
        break;

      case 'invite_link':
        this.handleInviteLink(data);
        break;

      default:
        console.warn('Unhandled deep link type:', data.type);
    }
  }

  /**
   * Handle password reset deep link
   */
  private handlePasswordReset(data: DeepLinkData): void {
    const { token, email, expires } = data;

    if (!token || !email) {
      Alert.alert(
        'Invalid Link',
        'This password reset link is invalid. Please request a new one.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if link has expired
    if (expires) {
      const expiryDate = new Date(expires);
      if (expiryDate < new Date()) {
        Alert.alert(
          'Link Expired',
          'This password reset link has expired. Please request a new one.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Navigate to password reset screen with pre-filled data
    if (navigationService.isReady()) {
      navigationService.navigate('PasswordRecovery', {
        email,
        token,
        fromDeepLink: true,
      });
    } else {
      // Store for later processing when navigation is ready
      this.pendingLink = data;
    }
  }

  /**
   * Handle email verification deep link
   */
  private handleEmailVerification(data: DeepLinkData): void {
    const { token, email, userId } = data;

    if (!token || !email) {
      Alert.alert(
        'Invalid Link',
        'This verification link is invalid.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Auto-verify email if possible
    this.autoVerifyEmail(token, email);
  }

  /**
   * Handle account activation deep link
   */
  private handleAccountActivation(data: DeepLinkData): void {
    const { token, userId } = data;

    if (!token || !userId) {
      Alert.alert(
        'Invalid Link',
        'This activation link is invalid.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Handle account activation
    this.activateAccount(token, userId);
  }

  /**
   * Handle payment callback from Paystack
   */
  private handlePaymentCallback(data: DeepLinkData): void {
    const { reference, status, packageType } = data;

    console.log('Payment callback received:', { reference, status, packageType });

    // Determine if payment was successful
    const isSuccess = status === 'success' || status === 'successful';

    // Navigate to appropriate screen
    if (navigationService.isReady()) {
      if (isSuccess && reference) {
        // Navigate to success screen
        navigationService.navigate('PaymentSuccess', {
          reference,
          packageType,
        });
      } else {
        // Navigate to error screen
        const errorMessage = status === 'cancelled'
          ? 'Payment was cancelled'
          : 'Payment could not be completed';

        navigationService.navigate('PaymentError', {
          reference,
          error: errorMessage,
        });
      }
    } else {
      // Store for later processing when navigation is ready
      this.pendingLink = data;
      console.log('Navigation not ready, storing payment callback as pending link');
    }
  }

  /**
   * Handle payment deep link
   */
  private handlePaymentLink(data: DeepLinkData): void {
    const { token, amount, recipient } = data;

    // Store payment link data for processing after authentication
    this.pendingLink = data;

    Alert.alert(
      'Payment Link',
      `You have a payment request${amount ? ` for $${amount}` : ''}${recipient ? ` from ${recipient}` : ''}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (navigationService.isReady()) {
              navigationService.navigate('PaymentFromLink', {
                token,
                amount,
                recipient
              });
            }
          }
        }
      ]
    );
  }

  /**
   * Handle invite link
   */
  private handleInviteLink(data: DeepLinkData): void {
    const { token, inviterId } = data;

    Alert.alert(
      'Invitation',
      'You have been invited to join SureBank!',
      [
        { text: 'Decline', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            navigationService.navigateToRegister();
            // Pass invite data to registration
          }
        }
      ]
    );
  }

  /**
   * Auto-verify email with token
   */
  private async autoVerifyEmail(token: string, email: string): Promise<void> {
    try {
      // This would call the verification API
      // const result = await authService.verifyEmailWithToken(token, email);
      
      Alert.alert(
        'Email Verified',
        'Your email has been successfully verified!',
        [
          { 
            text: 'Continue', 
            onPress: () => {
              navigationService.navigateToLogin();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        'Unable to verify your email. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Activate account with token
   */
  private async activateAccount(token: string, userId: string): Promise<void> {
    try {
      // This would call the activation API
      // const result = await authService.activateAccount(token, userId);
      
      Alert.alert(
        'Account Activated',
        'Your account has been successfully activated!',
        [
          { 
            text: 'Sign In', 
            onPress: () => {
              navigationService.navigateToLogin();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Activation Failed',
        'Unable to activate your account. Please contact support.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Process pending deep link when navigation is ready
   */
  processPendingLink(): void {
    if (this.pendingLink && navigationService.isReady()) {
      const link = this.pendingLink;
      this.pendingLink = null;
      this.processDeepLink(link);
    }
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(type: DeepLinkType, params: Record<string, string>): string {
    const baseURL = ExpoLinking.createURL('');
    const queryString = new URLSearchParams(params).toString();
    
    switch (type) {
      case 'password_reset':
        return `${baseURL}reset-password?${queryString}`;
      case 'email_verification':
        return `${baseURL}verify-email?${queryString}`;
      case 'account_activation':
        return `${baseURL}activate?${queryString}`;
      case 'payment_link':
        return `${baseURL}payment?${queryString}`;
      case 'invite_link':
        return `${baseURL}invite?${queryString}`;
      default:
        return baseURL;
    }
  }

  /**
   * Check if deep link can be handled
   */
  canHandleURL(url: string): boolean {
    try {
      const parsed = this.parseDeepLink(url);
      return parsed !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get current pending link
   */
  getPendingLink(): DeepLinkData | null {
    return this.pendingLink;
  }

  /**
   * Clear pending link
   */
  clearPendingLink(): void {
    this.pendingLink = null;
  }
}

// Create singleton instance
const deepLinkingService = new DeepLinkingService();

export default deepLinkingService;