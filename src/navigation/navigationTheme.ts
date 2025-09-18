/**
 * Navigation Theme Configuration
 * Centralized theme settings for all navigation components
 */

export const navigationTheme = {
  colors: {
    // Dark theme colors matching the new design
    primary: '#d4af37',        // Gold accent
    background: '#0f1721',     // Main dark background
    card: '#1a2c4f',          // Card/header background
    text: '#ffffff',          // Primary text
    border: '#1f3048',        // Subtle borders
    notification: '#d4af37',   // Notification badge
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
    height: 60, // Consistent header height
  },
  headerTintColor: '#d4af37', // Gold accent for back buttons
  headerTitleStyle: {
    fontWeight: '600' as const,
    color: '#ffffff', // White text
    fontSize: 18,
    textAlign: 'center' as const,
  },
  headerTitleAlign: 'center' as const, // Center align titles
  headerBackTitleVisible: false, // Hide back button text, show only icon
  headerLeftContainerStyle: {
    paddingLeft: 16,
  },
  headerRightContainerStyle: {
    paddingRight: 16,
  },
};

// Specific options for home screens (first screen in each stack)
export const homeScreenOptions = {
  ...stackScreenOptions,
  headerLeft: () => null, // Remove back button for home screens
};

// Specific options for secondary screens with back button
export const secondaryScreenOptions = {
  ...stackScreenOptions,
  // Back button will be automatically added by React Navigation
};

export const tabBarOptions = {
  activeTintColor: '#d4af37',   // Gold accent
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