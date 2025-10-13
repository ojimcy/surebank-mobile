/**
 * Settings Screen
 * Professional and beautiful settings screen with modern banking app design
 */

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainHeader } from '@/components/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { SettingsScreenProps } from '@/navigation/types';
import type { SettingsSection } from '@/components/settings/types';

interface UserProfileCardProps {
    user: any;
    onEditPress: () => void;
}

const UserProfileCard = ({ user, onEditPress }: UserProfileCardProps) => {
    const getUserInitials = () => {
        if (!user) return '';
        const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
        const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
        return `${firstInitial}${lastInitial}`;
    };

    const getVerificationStatus = () => {
        if (user?.kycStatus === 'verified') {
            return { text: 'Verified', color: '#10b981', backgroundColor: '#ecfdf5' };
        }
        return { text: 'Pending Verification', color: '#f59e0b', backgroundColor: '#fffbeb' };
    };

    const verificationStatus = getVerificationStatus();

    return (
        <LinearGradient
            colors={['#0066A1', '#0077B5', '#0088CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
        >
            <View style={styles.profileContent}>
                <View style={styles.profileLeft}>
                    <View style={styles.avatarContainer}>
                        {user ? (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getUserInitials()}</Text>
                            </View>
                        ) : (
                            <Ionicons name="person" size={24} color="#ffffff" />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {user ? `${user.firstName} ${user.lastName}` : 'User'}
                        </Text>
                        <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                        <View style={styles.statusContainer}>
                            <View style={styles.activeStatus}>
                                <View style={styles.activeDot} />
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                            <View style={[
                                styles.verificationStatus,
                                { backgroundColor: verificationStatus.backgroundColor }
                            ]}>
                                <Ionicons
                                    name={user?.kycStatus === 'verified' ? 'checkmark-circle' : 'time'}
                                    size={12}
                                    color={verificationStatus.color}
                                />
                                <Text style={[styles.verificationText, { color: verificationStatus.color }]}>
                                    {verificationStatus.text}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={onEditPress}
                    style={styles.editButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

interface SettingsSectionProps {
    section: SettingsSection;
}

const SettingsSection = ({ section }: SettingsSectionProps) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: section.iconBackgroundColor }]}>
                <Ionicons name={section.icon} size={16} color={section.iconColor} />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <View style={styles.sectionContent}>
            {section.items.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.settingsItem,
                        index === section.items.length - 1 && styles.lastItem,
                        item.disabled && styles.disabledItem,
                    ]}
                    onPress={item.onPress}
                    disabled={item.disabled}
                    activeOpacity={0.7}
                >
                    <View style={styles.itemLeft}>
                        <View style={styles.itemIcon}>
                            <Ionicons name={item.icon} size={20} color="#0066A1" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, item.disabled && styles.disabledText]}>
                                {item.title}
                            </Text>
                            <Text style={[styles.itemDescription, item.disabled && styles.disabledText]}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.itemRight}>
                        {item.badge && (
                            <View style={[styles.badge, { backgroundColor: item.badge.backgroundColor }]}>
                                <Text style={[styles.badgeText, { color: item.badge.color }]}>
                                    {item.badge.text}
                                </Text>
                            </View>
                        )}
                        {item.showChevron !== false && (
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

export default function SettingsScreen({ navigation }: SettingsScreenProps<'Settings'>) {
    const { user, logout, isLoading } = useAuth();

    const handleNotificationPress = () => {
        console.log('Notification pressed - screen not implemented yet');
        // TODO: Add Notifications screen to SettingsStack
        // navigation.navigate('Notifications');
    };

    const handleAvatarPress = () => {
        // Navigate back to dashboard (Account tab home)
        navigation.navigate('Settings');
    };

    const handleEditProfile = () => {
        navigation.navigate('PersonalInformation');
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out of your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout failed:', error);
                            // The AuthContext already handles the error and clears state
                        }
                    },
                },
            ]
        );
    };

    const settingsSections: SettingsSection[] = [
        {
            id: 'account',
            title: 'Account Management',
            icon: 'person-outline',
            iconColor: '#0066A1',
            iconBackgroundColor: 'rgba(0, 102, 161, 0.1)',
            items: [
                {
                    id: 'personal-info',
                    title: 'Personal Information',
                    description: 'View and update your personal information',
                    icon: 'person-outline',
                    onPress: handleEditProfile,
                },
                {
                    id: 'kyc',
                    title: 'KYC & Verification',
                    description: 'Complete identity verification',
                    icon: 'shield-checkmark-outline',
                    onPress: () => navigation.navigate('KYCVerification'),
                    badge: user?.kycStatus !== 'verified' ? {
                        text: 'Required',
                        color: '#f59e0b',
                        backgroundColor: '#fffbeb',
                    } : undefined,
                },
            ],
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: 'shield-outline',
            iconColor: '#ef4444',
            iconBackgroundColor: '#fef2f2',
            items: [
                {
                    id: 'security-pin',
                    title: 'Security PIN',
                    description: 'Set up a PIN for app security',
                    icon: 'lock-closed-outline',
                    onPress: () => navigation.navigate('SecurityPin'),
                },
                {
                    id: 'password',
                    title: 'Password',
                    description: 'Change your account password',
                    icon: 'key-outline',
                    onPress: () => navigation.navigate('ChangePassword'),
                },
            ],
        },
        {
            id: 'financial',
            title: 'Financial Management',
            icon: 'card-outline',
            iconColor: '#10b981',
            iconBackgroundColor: '#ecfdf5',
            items: [
                {
                    id: 'transactions',
                    title: 'Transaction History',
                    description: 'View all your transactions and payments',
                    icon: 'receipt-outline',
                    onPress: () => navigation.navigate('TransactionHistory'),
                },
                {
                    id: 'payment-methods',
                    title: 'Payment Methods',
                    description: 'Manage cards and payment options',
                    icon: 'card-outline',
                    onPress: () => navigation.navigate('PaymentMethods'),
                }
            ],
        },
        {
            id: 'preferences',
            title: 'App Preferences',
            icon: 'settings-outline',
            iconColor: '#6366f1',
            iconBackgroundColor: '#eef2ff',
            items: [
                {
                    id: 'notifications',
                    title: 'Notifications',
                    description: 'Manage notification preferences',
                    icon: 'notifications-outline',
                    onPress: () => navigation.navigate('NotificationSettings'),
                },
                {
                    id: 'theme',
                    title: 'App Theme',
                    description: 'Light mode',
                    icon: 'color-palette-outline',
                    onPress: () => navigation.navigate('Theme'),
                },
            ],
        },
        {
            id: 'support',
            title: 'Support & About',
            icon: 'help-circle-outline',
            iconColor: '#f59e0b',
            iconBackgroundColor: '#fffbeb',
            items: [
                {
                    id: 'help',
                    title: 'Help & Support',
                    description: 'Get help with your account',
                    icon: 'help-circle-outline',
                    onPress: () => navigation.navigate('Help'),
                },
                {
                    id: 'privacy',
                    title: 'Privacy Policy',
                    description: 'Read our privacy policy',
                    icon: 'document-outline',
                    onPress: () => navigation.navigate('PrivacyPolicy'),
                },
                {
                    id: 'terms',
                    title: 'Terms of Service',
                    description: 'Read our terms of service',
                    icon: 'document-text-outline',
                    onPress: () => navigation.navigate('TermsOfService'),
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <UserProfileCard user={user} onEditPress={handleEditProfile} />

                {/* Settings Sections */}
                {settingsSections.map((section) => (
                    <SettingsSection key={section.id} section={section} />
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    disabled={isLoading}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Loading Overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0066A1" />
                        <Text style={styles.loadingText}>Signing out...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        paddingBottom: 32,
    },
    // Profile Card Styles
    profileCard: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    profileContent: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    activeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
    },
    activeText: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    verificationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    verificationText: {
        fontSize: 11,
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Section Styles
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
    },
    sectionContent: {
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    // Settings Item Styles
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    disabledItem: {
        opacity: 0.5,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    itemDescription: {
        fontSize: 13,
        color: '#6b7280',
    },
    disabledText: {
        color: '#9ca3af',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    // Logout Button Styles
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 8,
        paddingVertical: 16,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
    // Loading Overlay Styles
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 200,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
});
