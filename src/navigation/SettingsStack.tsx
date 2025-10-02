import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';

import type { SettingsStackParamList } from './types';

// Import settings screens
import {
  SettingsScreen,
  PersonalInformationScreen,
  NotificationSettingsScreen
} from '@/screens/Settings';
import KYCVerificationScreen from '@/screens/Settings/KYCVerificationScreen';
import KYCIdVerificationScreen from '@/screens/Settings/KYCIdVerificationScreen';
import KYCSuccessScreen from '@/screens/Settings/KYCSuccessScreen';
import ThemeSettingsScreen from '@/screens/Settings/ThemeSettingsScreen';
import HelpSupportScreen from '@/screens/Settings/HelpSupportScreen';
import PrivacyPolicyScreen from '@/screens/Settings/PrivacyPolicyScreen';
import TermsOfServiceScreen from '@/screens/Settings/TermsOfServiceScreen';
import TransactionHistoryScreen from '@/screens/History/TransactionHistoryScreen';
import CardsListScreen from '@/screens/Cards/CardsListScreen';

// Placeholder screens for future implementation
const PlaceholderScreen = () => null;

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...mainScreenOptions,
          title: 'Settings'
        }}
      />
      <Stack.Screen
        name="PersonalInformation"
        component={PersonalInformationScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Personal Information'
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Notification Settings'
        }}
      />
      <Stack.Screen
        name="SecurityPin"
        component={PlaceholderScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Security PIN'
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={PlaceholderScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Change Password'
        }}
      />
      <Stack.Screen
        name="TwoFactorAuth"
        component={PlaceholderScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Two-Factor Authentication'
        }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Transaction History'
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={CardsListScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Payment Methods'
        }}
      />
      <Stack.Screen
        name="Statements"
        component={PlaceholderScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Statements'
        }}
      />
      <Stack.Screen
        name="KYCVerification"
        component={KYCVerificationScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'KYC Verification'
        }}
      />
      <Stack.Screen
        name="KYCIdVerification"
        component={KYCIdVerificationScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'ID Verification'
        }}
      />
      <Stack.Screen
        name="KYCSuccess"
        component={KYCSuccessScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Verification Success'
        }}
      />
      <Stack.Screen
        name="Theme"
        component={ThemeSettingsScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'App Theme'
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpSupportScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Help & Support'
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Privacy Policy'
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'Terms of Service'
        }}
      />
      <Stack.Screen
        name="About"
        component={PlaceholderScreen}
        options={{
          ...secondaryScreenOptions,
          title: 'About SureBank'
        }}
      />
    </Stack.Navigator>
  );
}