/**
 * Navigation Theme Configuration
 * Centralized theme settings for all navigation components
 */

export const navigationTheme = {
  colors: {
    // Light theme colors matching the Capacitor app
    primary: '#0066A1',        // Blue accent
    background: '#ffffff',     // White background
    card: '#ffffff',          // Card/header background
    text: '#111827',          // Dark text
    border: '#e5e7eb',        // Light borders
    notification: '#0066A1',   // Notification badge
  },
  dark: false,
};

export const stackScreenOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: '#ffffff', // White background
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // Light border
    elevation: 0,
    shadowOpacity: 0,
    height: 60, // Consistent header height
  },
  headerTintColor: '#0066A1', // Blue accent for back buttons
  headerTitleStyle: {
    fontWeight: '600' as const,
    color: '#111827', // Dark text
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

// Custom header options for main screens with MainHeader component
export const mainScreenOptions = {
  headerShown: false, // We'll use our custom header component instead
};

// Specific options for secondary screens with back button
export const secondaryScreenOptions = {
  ...stackScreenOptions,
  // Back button will be automatically added by React Navigation
};

export const tabBarOptions = {
  activeTintColor: '#0066A1',   // Blue accent
  inactiveTintColor: '#6c757d', // Muted text
  style: {
    backgroundColor: '#ffffff',  // White background
    borderTopColor: '#e5e8ed',   // Light border
    borderTopWidth: 1,
    paddingBottom: 5,
    height: 60,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};