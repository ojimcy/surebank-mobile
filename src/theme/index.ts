/**
 * SureBank Design System
 * 
 * A comprehensive theme system for building professional financial interfaces.
 * This design system provides consistent colors, typography, spacing, components,
 * and animations that reflect SureBank's values of trust, security, and innovation.
 * 
 * @version 1.0.0
 * @author SureBank Team
 */

import colors, { colorUtils } from './colors';
import typography, { typographyUtils, fontFamilies, fontSizes } from './typography';
import spacing, { spacingUtils } from './spacing';
import components from './components';
import animations, { animationUtils } from './animations';

// Main theme object
export const theme = {
  colors,
  typography,
  spacing,
  components,
  animations,
} as const;

// Utility functions
export const themeUtils = {
  colors: colorUtils,
  typography: typographyUtils,
  spacing: spacingUtils,
  animations: animationUtils,
} as const;

// Theme configuration for different modes
export const themeConfig = {
  // Default light mode
  light: {
    background: colors.light.background,
    foreground: colors.light.foreground,
    card: colors.light.card,
    border: colors.gray[200],
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },
  
  // Dark mode configuration
  dark: {
    background: colors.dark.background,
    foreground: colors.dark.foreground,
    card: colors.dark.card,
    border: colors.gray[700],
    primary: colors.primary[400], // Lighter primary for dark backgrounds
    secondary: colors.secondary[400],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],
  },
} as const;

// Brand constants
export const brand = {
  name: 'SureBank',
  tagline: 'Your Trusted Financial Partner',
  colors: {
    primary: colors.primary[500],      // #0066A1 - SureBank Blue
    secondary: colors.secondary[500],   // #0ea5e9 - Innovation Blue
    accent: colors.accent[500],         // #f59e0b - Premium Gold
  },
  fonts: {
    primary: fontFamilies.sans,
    mono: fontFamilies.mono,
  },
} as const;

// Design tokens for external integrations
export const tokens = {
  // Color tokens
  colors: {
    'primary-50': colors.primary[50],
    'primary-100': colors.primary[100],
    'primary-200': colors.primary[200],
    'primary-300': colors.primary[300],
    'primary-400': colors.primary[400],
    'primary-500': colors.primary[500],
    'primary-600': colors.primary[600],
    'primary-700': colors.primary[700],
    'primary-800': colors.primary[800],
    'primary-900': colors.primary[900],
    
    'success-500': colors.success[500],
    'warning-500': colors.warning[500],
    'error-500': colors.error[500],
    
    'gray-50': colors.gray[50],
    'gray-100': colors.gray[100],
    'gray-200': colors.gray[200],
    'gray-500': colors.gray[500],
    'gray-900': colors.gray[900],
  },
  
  // Spacing tokens
  spacing: {
    'xs': spacing.spacing[1],      // 4px
    'sm': spacing.spacing[2],      // 8px
    'md': spacing.spacing[4],      // 16px
    'lg': spacing.spacing[6],      // 24px
    'xl': spacing.spacing[8],      // 32px
    '2xl': spacing.spacing[12],    // 48px
  },
  
  // Typography tokens
  typography: {
    'text-xs': fontSizes.xs,
    'text-sm': fontSizes.sm,
    'text-base': fontSizes.base,
    'text-lg': fontSizes.lg,
    'text-xl': fontSizes.xl,
    'text-2xl': fontSizes['2xl'],
  },
  
  // Animation tokens
  animations: {
    'duration-fast': `${animations.durations.fast}ms`,
    'duration-normal': `${animations.durations.normal}ms`,
    'duration-slow': `${animations.durations.slow}ms`,
    
    'ease-in-out': animations.easings.easeInOut,
    'ease-out': animations.easings.easeOut,
    'ease-gentle': animations.easings.gentle,
  },
} as const;

// Semantic color helpers
export const semanticColors = {
  /**
   * Get color for financial values
   */
  financial: (value: number) => colorUtils.getFinancialColor(value),
  
  /**
   * Get status color
   */
  status: (status: 'active' | 'inactive' | 'pending' | 'error') => {
    const statusMap = {
      active: colors.success[500],
      inactive: colors.gray[400],
      pending: colors.warning[500],
      error: colors.error[500],
    };
    return statusMap[status];
  },
  
  /**
   * Get priority color
   */
  priority: (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const priorityMap = {
      low: colors.gray[400],
      medium: colors.warning[500],
      high: colors.warning[600],
      urgent: colors.error[500],
    };
    return priorityMap[priority];
  },
} as const;

// Component size presets
export const sizes = {
  button: {
    small: { height: 36, paddingHorizontal: 12 },
    medium: { height: 44, paddingHorizontal: 16 },
    large: { height: 52, paddingHorizontal: 24 },
  },
  
  input: {
    small: { height: 36, paddingHorizontal: 12 },
    medium: { height: 44, paddingHorizontal: 16 },
    large: { height: 52, paddingHorizontal: 16 },
  },
  
  card: {
    padding: {
      small: 12,
      medium: 16,
      large: 24,
    },
    borderRadius: 12,
  },
  
  avatar: {
    small: 32,
    medium: 40,
    large: 56,
    xlarge: 72,
  },
} as const;

// Accessibility helpers
export const a11y = {
  /**
   * Minimum touch target size (44px for iOS, 48px for Android)
   */
  minTouchTarget: 44,
  
  /**
   * Get contrast-safe text color for background
   */
  getTextColor: colorUtils.getTextColor,
  
  /**
   * High contrast color pairs
   */
  highContrast: {
    light: {
      background: colors.gray[50],
      text: colors.gray[900],
      primary: colors.primary[700],
    },
    dark: {
      background: colors.gray[900],
      text: colors.gray[50],
      primary: colors.primary[300],
    },
  },
  
  /**
   * Focus ring styles
   */
  focusRing: {
    width: 2,
    color: colors.primary[500],
    offset: 2,
  },
} as const;

// Export individual systems
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { default as componentsSystem } from './components';
export { animations } from './animations';

// Export utility functions
export { colorUtils } from './colors';
export { typographyUtils } from './typography';
export { spacingUtils } from './spacing';
export { animationUtils } from './animations';

// Export component variants for TypeScript
export type {
  ButtonVariants,
  CardVariants,
  InputVariants,
  BadgeVariants,
  AlertVariants,
  FinancialValueVariants,
  StatusVariants,
  SpinnerVariants,
  SkeletonVariants,
} from './components';

// Main theme export
export default theme;