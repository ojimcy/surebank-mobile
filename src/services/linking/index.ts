/**
 * SureBank Linking Services
 * 
 * Deep linking and URL handling services
 */

export { default as deepLinkingService } from './DeepLinkingService';
export type { DeepLinkType, DeepLinkData } from './DeepLinkingService';

export { default as useDeepLinking } from '@/hooks/useDeepLinking';