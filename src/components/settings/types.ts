/**
 * Settings Component Types
 * Type definitions for all settings-related components and data structures
 */

import { Ionicons } from '@expo/vector-icons';

export interface SettingsSection {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
    items: SettingsItem[];
}

export interface SettingsItem {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    showChevron?: boolean;
    badge?: {
        text: string;
        color: string;
        backgroundColor: string;
    };
    disabled?: boolean;
}

export interface UserProfileCardProps {
    user: any; // Will be replaced with proper User type
    onEditPress: () => void;
    onAvatarPress?: () => void;
}

export interface SettingsSectionProps {
    section: SettingsSection;
}

export interface SettingsItemProps {
    item: SettingsItem;
}

// Settings screen navigation types
export interface SettingsNavigationProps {
    onPersonalInfoPress: () => void;
    onKycPress: () => void;
    onSecurityPinPress: () => void;
    onPasswordPress: () => void;
    onTwoFactorPress: () => void;
    onTransactionHistoryPress: () => void;
    onPaymentMethodsPress: () => void;
    onStatementsPress: () => void;
    onOrdersPress: () => void;
    onNotificationsPress: () => void;
    onHelpPress: () => void;
    onAboutPress: () => void;
    onLogoutPress: () => void;
}

// Personal information types
export interface PersonalInfoFormData {
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber: string;
}

export interface PersonalInfoProps {
    user: any;
    onSave: (data: PersonalInfoFormData) => Promise<void>;
    onBack: () => void;
}

// Notification preferences types
export interface NotificationPreference {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    type: 'push' | 'email' | 'sms';
}

export interface NotificationCategory {
    id: string;
    title: string;
    description: string;
    preferences: NotificationPreference[];
}

export interface NotificationSettingsProps {
    categories: NotificationCategory[];
    onSave: (preferences: Record<string, boolean>) => Promise<void>;
    onBack: () => void;
}
