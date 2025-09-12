/**
 * SureBank Spacing System
 * 
 * Consistent spacing scale based on 4px grid system.
 * Provides semantic spacing tokens for professional financial interfaces.
 */

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Core spacing scale (in pixels, converted to rem)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',    // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  11: '2.75rem',      // 44px
  12: '3rem',         // 48px
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  18: '4.5rem',       // 72px
  20: '5rem',         // 80px
  24: '6rem',         // 96px
  28: '7rem',         // 112px
  32: '8rem',         // 128px
  36: '9rem',         // 144px
  40: '10rem',        // 160px
  44: '11rem',        // 176px
  48: '12rem',        // 192px
  52: '13rem',        // 208px
  56: '14rem',        // 224px
  60: '15rem',        // 240px
  64: '16rem',        // 256px
  72: '18rem',        // 288px
  80: '20rem',        // 320px
  96: '24rem',        // 384px
} as const;

// Component-specific spacing presets
export const componentSpacing = {
  // Button padding
  button: {
    small: {
      x: spacing[3],      // 12px horizontal
      y: spacing[2],      // 8px vertical
    },
    medium: {
      x: spacing[4],      // 16px horizontal
      y: spacing[2.5],    // 10px vertical
    },
    large: {
      x: spacing[6],      // 24px horizontal
      y: spacing[3],      // 12px vertical
    },
  },
  
  // Card padding and margins
  card: {
    padding: {
      small: spacing[3],    // 12px
      medium: spacing[4],   // 16px
      large: spacing[6],    // 24px
    },
    margin: {
      small: spacing[2],    // 8px
      medium: spacing[4],   // 16px
      large: spacing[6],    // 24px
    },
    gap: spacing[4],        // 16px between cards
  },
  
  // Form elements
  form: {
    fieldSpacing: spacing[4],     // 16px between form fields
    labelMargin: spacing[1.5],    // 6px below labels
    inputPadding: {
      x: spacing[3],              // 12px horizontal
      y: spacing[2.5],            // 10px vertical
    },
    groupSpacing: spacing[6],     // 24px between form groups
  },
  
  // List items
  list: {
    itemPadding: {
      x: spacing[4],              // 16px horizontal
      y: spacing[3],              // 12px vertical
    },
    itemSpacing: spacing[1],      // 4px between items
    sectionSpacing: spacing[6],   // 24px between sections
  },
  
  // Navigation
  navigation: {
    tabPadding: {
      x: spacing[4],              // 16px horizontal
      y: spacing[3],              // 12px vertical
    },
    menuItemPadding: {
      x: spacing[4],              // 16px horizontal
      y: spacing[3],              // 12px vertical
    },
  },
  
  // Layout containers
  layout: {
    screenPadding: {
      x: spacing[4],              // 16px horizontal screen padding
      y: spacing[6],              // 24px vertical screen padding
    },
    sectionSpacing: spacing[8],   // 32px between major sections
    containerMaxWidth: '1200px', // Maximum container width
  },
} as const;

// Semantic spacing tokens for common use cases
export const semanticSpacing = {
  // Content spacing
  contentGap: {
    tight: spacing[2],        // 8px - for closely related content
    normal: spacing[4],       // 16px - for regular content spacing
    loose: spacing[6],        // 24px - for section breaks
    section: spacing[8],      // 32px - for major section breaks
  },
  
  // Interactive elements
  interactive: {
    minTouchTarget: '44px',   // Minimum touch target size (iOS/Android guidelines)
    buttonSpacing: spacing[3], // 12px between buttons
    iconSpacing: spacing[2],  // 8px between icon and text
  },
  
  // Financial data presentation
  financial: {
    balanceSpacing: spacing[1], // 4px between currency and amount
    rowSpacing: spacing[3],     // 12px between financial rows
    groupSpacing: spacing[5],   // 20px between financial groups
  },
  
  // Notifications and alerts
  alert: {
    padding: {
      x: spacing[4],            // 16px horizontal
      y: spacing[3],            // 12px vertical
    },
    iconSpacing: spacing[3],    // 12px between icon and text
  },
} as const;

// Responsive breakpoints for spacing adjustments
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Utility functions for spacing
export const spacingUtils = {
  /**
   * Get spacing value by key
   */
  getSpacing: (key: keyof typeof spacing): string => {
    return spacing[key];
  },
  
  /**
   * Create responsive padding
   */
  responsivePadding: (mobile: keyof typeof spacing, desktop?: keyof typeof spacing): string => {
    const mobilePadding = spacing[mobile];
    const desktopPadding = desktop ? spacing[desktop] : mobilePadding;
    return `${mobilePadding} /* mobile */ /* ${desktopPadding} desktop */`;
  },
  
  /**
   * Create consistent card spacing
   */
  cardSpacing: (size: 'small' | 'medium' | 'large' = 'medium') => {
    return componentSpacing.card.padding[size];
  },
  
  /**
   * Get touch-friendly spacing for interactive elements
   */
  touchTarget: (size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: '40px',
      medium: '44px',
      large: '48px',
    };
    return sizes[size];
  },
  
  /**
   * Calculate spacing based on multiples of base unit
   */
  multiply: (multiplier: number): string => {
    return `${(BASE_UNIT * multiplier) / 16}rem`;
  },
  
  /**
   * Create gap spacing for flex/grid layouts
   */
  gap: (size: 'tight' | 'normal' | 'loose' = 'normal') => {
    const gaps = {
      tight: spacing[2],    // 8px
      normal: spacing[4],   // 16px
      loose: spacing[6],    // 24px
    };
    return gaps[size];
  }
};

// Safe area insets for mobile devices
export const safeArea = {
  top: 'env(safe-area-inset-top)',
  right: 'env(safe-area-inset-right)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
} as const;

export default {
  spacing,
  componentSpacing,
  semanticSpacing,
  breakpoints,
  safeArea,
  utils: spacingUtils,
};