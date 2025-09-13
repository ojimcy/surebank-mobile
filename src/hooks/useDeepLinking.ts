/**
 * SureBank Deep Linking Hook
 * 
 * React hook for handling deep links in components
 */

import { useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import deepLinkingService, { DeepLinkData } from '@/services/linking/DeepLinkingService';
import { useAuth } from '@/contexts/AuthContext';
import navigationService from '@/navigation/NavigationService';

export function useDeepLinking() {
  const [pendingLink, setPendingLink] = useState<DeepLinkData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuth();

  // Initialize deep linking service
  useEffect(() => {
    const initializeDeepLinking = async () => {
      try {
        await deepLinkingService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize deep linking:', error);
      }
    };

    initializeDeepLinking();
  }, []);

  // Handle pending links when authentication status changes
  useEffect(() => {
    if (isInitialized && navigationService.isReady()) {
      const pending = deepLinkingService.getPendingLink();
      if (pending) {
        setPendingLink(pending);
        deepLinkingService.processPendingLink();
        deepLinkingService.clearPendingLink();
      }
    }
  }, [isInitialized, isAuthenticated]);

  // Generate deep link
  const generateLink = useCallback((type: DeepLinkData['type'], params: Record<string, string>) => {
    return deepLinkingService.generateDeepLink(type, params);
  }, []);

  // Check if URL can be handled
  const canHandleURL = useCallback((url: string) => {
    return deepLinkingService.canHandleURL(url);
  }, []);

  // Open deep link
  const openDeepLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening deep link:', error);
    }
  }, []);

  return {
    pendingLink,
    isInitialized,
    generateLink,
    canHandleURL,
    openDeepLink,
  };
}

export default useDeepLinking;