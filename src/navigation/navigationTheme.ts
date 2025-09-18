/**
 * Navigation Theme Configuration
 * Centralized theme settings for all navigation components
 */

export const navigationTheme = {
  colors: {
    // Dark theme colors matching the new design
    primary: '#f5d523',        // Yellow accent
    background: '#0f1721',     // Main dark background
    card: '#1a2c4f',          // Card/header background
    text: '#ffffff',          // Primary text
    border: '#1f3048',        // Subtle borders
    notification: '#f5d523',   // Notification badge
  },
  dark: true,
};

export const stackScreenOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: '#0f1721', // Main dark background
    borderBottomWidth: 1,
    borderBottomColor: '#1f3048', // Subtle border
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#f5d523', // Yellow accent for back buttons
  headerTitleStyle: {
    fontWeight: '600' as const,
    color: '#ffffff', // White text
    fontSize: 18,
  },
};

export const tabBarOptions = {
  activeTintColor: '#f5d523',   // Yellow accent
  inactiveTintColor: '#94a3b8', // Muted text
  style: {
    backgroundColor: '#0f1721',  // Main dark background
    borderTopColor: '#1f3048',   // Subtle border
    borderTopWidth: 1,
    paddingBottom: 5,
    height: 60,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};