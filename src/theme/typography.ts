/**
 * SureBank Typography System
 * 
 * Professional typography scale designed for financial interfaces.
 * Optimized for readability and hierarchy across mobile devices.
 */

// Font families
export const fontFamilies = {
  sans: [
    'SF Pro Display',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  mono: [
    'SF Mono',
    'Monaco',
    'Cascadia Code',
    'Roboto Mono',
    'Consolas',
    'monospace'
  ],
} as const;

// Font weights
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Font sizes (in rem units for scalability)
export const fontSizes = {
  xs: '0.75rem',    // 12px - Small labels, captions
  sm: '0.875rem',   // 14px - Body text, secondary info
  base: '1rem',     // 16px - Base body text
  lg: '1.125rem',   // 18px - Large body text
  xl: '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',  // 24px - Medium headings
  '3xl': '1.875rem', // 30px - Large headings
  '4xl': '2.25rem', // 36px - Extra large headings
  '5xl': '3rem',    // 48px - Display headings
} as const;

// Line heights
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography variants for common use cases
export const typography = {
  // Display headings - for heroes, major sections
  display: {
    large: {
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    medium: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    small: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Headings - for page titles, section headers
  heading: {
    h1: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h3: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Body text - for paragraphs, descriptions
  body: {
    large: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Labels - for form labels, buttons, tabs
  label: {
    large: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
    medium: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
    small: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wider,
    },
  },
  
  // Financial numbers - for amounts, balances
  financial: {
    large: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontFamily: fontFamilies.mono,
    },
    medium: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontFamily: fontFamilies.mono,
    },
    small: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fontFamilies.mono,
    },
  },
  
  // Captions - for small descriptive text
  caption: {
    medium: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Buttons - for interactive elements
  button: {
    large: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.wide,
    },
    medium: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.wide,
    },
    small: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.wider,
    },
  },
} as const;

// Utility functions for typography
export const typographyUtils = {
  /**
   * Format currency values with proper typography
   */
  formatCurrency: (amount: number, currency = '₦'): string => {
    return `${currency}${amount.toLocaleString()}`;
  },
  
  /**
   * Get responsive font size based on screen size
   */
  getResponsiveFontSize: (base: string, scale: number = 0.875): string => {
    // For smaller screens, scale down the font size
    const baseValue = parseFloat(base);
    return `${baseValue * scale}rem`;
  },
  
  /**
   * Create text shadow for better readability
   */
  createTextShadow: (color: string = 'rgba(0, 0, 0, 0.1)'): string => {
    return `0 1px 2px ${color}`;
  },
  
  /**
   * Get appropriate line height for font size
   */
  getLineHeight: (fontSize: keyof typeof fontSizes): keyof typeof lineHeights => {
    const sizeMap = {
      xs: 'normal',
      sm: 'normal',
      base: 'normal',
      lg: 'relaxed',
      xl: 'snug',
      '2xl': 'snug',
      '3xl': 'tight',
      '4xl': 'tight',
      '5xl': 'tight',
    } as const;
    
    return sizeMap[fontSize] || 'normal';
  }
};

export default typography;