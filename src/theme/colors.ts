/**
 * SureBank Professional Color System
 * 
 * A comprehensive color system that provides semantic color tokens
 * for building trustworthy and professional financial interfaces.
 */

// Primary brand colors - SureBank Blue (Trust & Security)
export const primary = {
  50: '#eff6ff',   // Very light blue for backgrounds
  100: '#dbeafe',  // Light blue for subtle backgrounds  
  200: '#bfdbfe',  // Soft blue for disabled states
  300: '#93c5fd',  // Medium light blue
  400: '#60a5fa',  // Medium blue
  500: '#0066A1',  // Main SureBank blue
  600: '#005580',  // Darker blue for hover states
  700: '#004466',  // Deep blue for active states
  800: '#003355',  // Very deep blue
  900: '#002244',  // Darkest blue
} as const;

// Secondary colors - Light Blue (Innovation & Tech)
export const secondary = {
  50: '#f0f9ff',   // Very light sky
  100: '#e0f2fe',  // Light sky backgrounds
  200: '#bae6fd',  // Soft sky
  300: '#7dd3fc',  // Medium sky
  400: '#38bdf8',  // Bright sky
  500: '#0ea5e9',  // Main secondary blue
  600: '#0284c7',  // Darker sky
  700: '#0369a1',  // Deep sky
  800: '#075985',  // Very dark sky
  900: '#0c4a6e',  // Darkest sky
} as const;

// Success colors - Professional Green (Growth & Profits)
export const success = {
  50: '#f0fdf4',   // Very light green
  100: '#dcfce7',  // Light green backgrounds
  200: '#bbf7d0',  // Soft green
  300: '#86efac',  // Medium light green
  400: '#4ade80',  // Medium green
  500: '#10b981',  // Main success green
  600: '#059669',  // Darker green for buttons
  700: '#047857',  // Deep green
  800: '#065f46',  // Very deep green
  900: '#064e3b',  // Darkest green
} as const;

// Warning colors - Professional Gold (Pending & Premium)
export const warning = {
  50: '#fffbeb',   // Very light amber
  100: '#fef3c7',  // Light amber backgrounds
  200: '#fde68a',  // Soft amber
  300: '#fcd34d',  // Medium light amber
  400: '#fbbf24',  // Medium amber
  500: '#f59e0b',  // Main warning gold
  600: '#d97706',  // Darker amber
  700: '#b45309',  // Deep amber
  800: '#92400e',  // Very deep amber
  900: '#78350f',  // Darkest amber
} as const;

// Error colors - Professional Red (Alerts & Losses)
export const error = {
  50: '#fef2f2',   // Very light red
  100: '#fee2e2',  // Light red backgrounds
  200: '#fecaca',  // Soft red
  300: '#fca5a5',  // Medium light red
  400: '#f87171',  // Medium red
  500: '#dc2626',  // Main error red
  600: '#b91c1c',  // Darker red
  700: '#991b1b',  // Deep red
  800: '#7f1d1d',  // Very deep red
  900: '#450a0a',  // Darkest red
} as const;

// Professional grays - Clean & Modern
export const gray = {
  50: '#f8fafc',   // Background light
  100: '#f1f5f9',  // Card backgrounds light
  200: '#e2e8f0',  // Borders light
  300: '#cbd5e1',  // Subtle borders
  400: '#94a3b8',  // Placeholder text
  500: '#64748b',  // Secondary text
  600: '#475569',  // Body text
  700: '#334155',  // Heading text
  800: '#1e293b',  // Dark text
  900: '#0f172a',  // Primary text
} as const;

// Accent colors - Premium Gold (VIP Features)
export const accent = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',  // Premium gold
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const;

// Semantic color mappings for different contexts
export const semantic = {
  // Financial contexts
  profit: success[500],      // Green for positive values
  loss: error[500],          // Red for negative values
  pending: warning[500],     // Gold for pending transactions
  premium: accent[500],      // Gold for premium features
  
  // UI contexts
  focus: primary[500],       // Blue for focus states
  disabled: gray[300],       // Light gray for disabled
  placeholder: gray[400],    // Medium gray for placeholders
  
  // Status contexts
  active: primary[500],      // Blue for active states
  inactive: gray[400],       // Gray for inactive states
  selected: primary[100],    // Light blue for selected items
} as const;

// Light/Dark mode semantic colors
export const lightMode = {
  background: '#ffffff',
  foreground: gray[900],
  card: '#ffffff',
  cardForeground: gray[900],
  muted: gray[100],
  mutedForeground: gray[500],
  border: gray[200],
  input: '#ffffff',
} as const;

export const darkMode = {
  background: gray[900],
  foreground: gray[50],
  card: gray[800],
  cardForeground: gray[50],
  muted: gray[700],
  mutedForeground: gray[400],
  border: gray[700],
  input: gray[800],
} as const;

// Color utility functions
export const colorUtils = {
  /**
   * Get color for financial values
   */
  getFinancialColor: (value: number): string => {
    if (value > 0) return success[500];
    if (value < 0) return error[500];
    return gray[500];
  },
  
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  /**
   * Get appropriate text color for background
   */
  getTextColor: (backgroundColor: string): string => {
    // Simple light/dark detection
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? gray[900] : gray[50];
  }
};

// Export complete color palette
export const colors = {
  primary,
  secondary,
  success,
  warning,
  error,
  gray,
  accent,
  semantic,
  light: lightMode,
  dark: darkMode,
} as const;

export default colors;