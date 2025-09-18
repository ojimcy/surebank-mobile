/**
 * Notification Settings Screen
 * Professional screen for managing notification preferences
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NestedHeader } from '@/components/navigation';
import type { SettingsScreenProps } from '@/navigation/types';

interface NotificationPreference {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    type: 'push' | 'email' | 'sms';
    icon: keyof typeof Ionicons.glyphMap;
}

interface NotificationCategory {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
    preferences: NotificationPreference[];
}

export default function NotificationSettingsScreen({
    navigation
}: SettingsScreenProps<'NotificationSettings'>) {
    const [categories, setCategories] = useState<NotificationCategory[]>([
        {
            id: 'transactions',
            title: 'Transaction Notifications',
            description: 'Get notified about your financial activities',
            icon: 'card-outline',
            iconColor: '#10b981',
            iconBackgroundColor: '#ecfdf5',
            preferences: [
                {
                    id: 'transaction-push',
                    title: 'Transaction Alerts',
                    description: 'Instant notifications for deposits and withdrawals',
                    enabled: true,
                    type: 'push',
                    icon: 'notifications-outline',
                },
                {
                    id: 'transaction-email',
                    title: 'Transaction Emails',
                    description: 'Email confirmations for all transactions',
                    enabled: true,
                    type: 'email',
                    icon: 'mail-outline',
                },
                {
                    id: 'low-balance',
                    title: 'Low Balance Alerts',
                    description: 'Get notified when your balance is low',
                    enabled: false,
                    type: 'push',
                    icon: 'warning-outline',
                },
            ],
        },
        {
            id: 'security',
            title: 'Security Alerts',
            description: 'Important security and account updates',
            icon: 'shield-outline',
            iconColor: '#ef4444',
            iconBackgroundColor: '#fef2f2',
            preferences: [
                {
                    id: 'login-alerts',
                    title: 'Login Notifications',
                    description: 'Get notified of new device logins',
                    enabled: true,
                    type: 'push',
                    icon: 'log-in-outline',
                },
                {
                    id: 'security-email',
                    title: 'Security Updates',
                    description: 'Email notifications for security changes',
                    enabled: true,
                    type: 'email',
                    icon: 'shield-checkmark-outline',
                },
                {
                    id: 'password-changes',
                    title: 'Password Changes',
                    description: 'Immediate alerts for password modifications',
                    enabled: true,
                    type: 'push',
                    icon: 'key-outline',
                },
            ],
        },
        {
            id: 'account',
            title: 'Account Updates',
            description: 'Account status and verification notifications',
            icon: 'person-outline',
            iconColor: '#0066A1',
            iconBackgroundColor: 'rgba(0, 102, 161, 0.1)',
            preferences: [
                {
                    id: 'kyc-updates',
                    title: 'KYC Status Updates',
                    description: 'Notifications about verification progress',
                    enabled: true,
                    type: 'push',
                    icon: 'checkmark-circle-outline',
                },
                {
                    id: 'account-email',
                    title: 'Account Notifications',
                    description: 'General account updates via email',
                    enabled: false,
                    type: 'email',
                    icon: 'mail-outline',
                },
            ],
        },
        {
            id: 'marketing',
            title: 'Marketing & Promotions',
            description: 'Updates about new features and offers',
            icon: 'megaphone-outline',
            iconColor: '#6366f1',
            iconBackgroundColor: '#eef2ff',
            preferences: [
                {
                    id: 'promotions',
                    title: 'Promotional Offers',
                    description: 'Special offers and discounts',
                    enabled: false,
                    type: 'push',
                    icon: 'pricetag-outline',
                },
                {
                    id: 'product-updates',
                    title: 'Product Updates',
                    description: 'New features and product announcements',
                    enabled: false,
                    type: 'email',
                    icon: 'rocket-outline',
                },
                {
                    id: 'newsletter',
                    title: 'Newsletter',
                    description: 'Monthly newsletter with tips and updates',
                    enabled: false,
                    type: 'email',
                    icon: 'newspaper-outline',
                },
            ],
        },
    ]);

    const handleBack = () => {
        navigation.goBack();
    };

    const togglePreference = (categoryId: string, preferenceId: string) => {
        setCategories(prev =>
            prev.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        preferences: category.preferences.map(pref =>
                            pref.id === preferenceId
                                ? { ...pref, enabled: !pref.enabled }
                                : pref
                        ),
                    };
                }
                return category;
            })
        );
    };

    const toggleAllInCategory = (categoryId: string, enabled: boolean) => {
        setCategories(prev =>
            prev.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        preferences: category.preferences.map(pref => ({ ...pref, enabled })),
                    };
                }
                return category;
            })
        );
    };

    const saveSettings = () => {
        // TODO: Implement API call to save notification preferences
        console.log('Saving notification preferences:', categories);
        Alert.alert('Success', 'Your notification preferences have been saved.');
    };

    const resetToDefaults = () => {
        Alert.alert(
            'Reset to Defaults',
            'Are you sure you want to reset all notification settings to their default values?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        // Reset to default values
                        setCategories(prev =>
                            prev.map(category => ({
                                ...category,
                                preferences: category.preferences.map(pref => ({
                                    ...pref,
                                    enabled: pref.id === 'transaction-push' ||
                                        pref.id === 'transaction-email' ||
                                        pref.id === 'login-alerts' ||
                                        pref.id === 'security-email' ||
                                        pref.id === 'password-changes' ||
                                        pref.id === 'kyc-updates',
                                })),
                            }))
                        );
                    },
                },
            ]
        );
    };

    const getCategoryEnabledCount = (category: NotificationCategory) => {
        return category.preferences.filter(pref => pref.enabled).length;
    };

    const getTypeIcon = (type: 'push' | 'email' | 'sms') => {
        switch (type) {
            case 'push':
                return 'phone-portrait-outline';
            case 'email':
                return 'mail-outline';
            case 'sms':
                return 'chatbubble-outline';
            default:
                return 'notifications-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <NestedHeader
                title="Notification Settings"
                onBackPress={handleBack}
                rightComponent={
                    <TouchableOpacity onPress={resetToDefaults} style={styles.resetButton}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <View style={styles.overviewIcon}>
                            <Ionicons name="notifications-outline" size={24} color="#0066A1" />
                        </View>
                        <View style={styles.overviewContent}>
                            <Text style={styles.overviewTitle}>Notification Preferences</Text>
                            <Text style={styles.overviewDescription}>
                                Manage how and when you receive notifications from SureBank
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Notification Categories */}
                {categories.map((category) => {
                    const enabledCount = getCategoryEnabledCount(category);
                    const totalCount = category.preferences.length;
                    const allEnabled = enabledCount === totalCount;
                    const noneEnabled = enabledCount === 0;

                    return (
                        <View key={category.id} style={styles.categoryCard}>
                            {/* Category Header */}
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryLeft}>
                                    <View style={[
                                        styles.categoryIcon,
                                        { backgroundColor: category.iconBackgroundColor }
                                    ]}>
                                        <Ionicons
                                            name={category.icon}
                                            size={20}
                                            color={category.iconColor}
                                        />
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryTitle}>{category.title}</Text>
                                        <Text style={styles.categoryDescription}>{category.description}</Text>
                                        <Text style={styles.categoryCount}>
                                            {enabledCount} of {totalCount} enabled
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.categoryActions}>
                                    <TouchableOpacity
                                        onPress={() => toggleAllInCategory(category.id, !allEnabled)}
                                        style={[
                                            styles.toggleAllButton,
                                            allEnabled ? styles.toggleAllButtonActive : styles.toggleAllButtonInactive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.toggleAllText,
                                            allEnabled ? styles.toggleAllTextActive : styles.toggleAllTextInactive
                                        ]}>
                                            {allEnabled ? 'Disable All' : 'Enable All'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Category Preferences */}
                            <View style={styles.preferencesContainer}>
                                {category.preferences.map((preference) => (
                                    <View key={preference.id} style={styles.preferenceItem}>
                                        <View style={styles.preferenceLeft}>
                                            <View style={styles.preferenceIconContainer}>
                                                <Ionicons
                                                    name={getTypeIcon(preference.type)}
                                                    size={16}
                                                    color="#6b7280"
                                                />
                                            </View>
                                            <View style={styles.preferenceContent}>
                                                <Text style={styles.preferenceTitle}>{preference.title}</Text>
                                                <Text style={styles.preferenceDescription}>
                                                    {preference.description}
                                                </Text>
                                                <View style={styles.preferenceType}>
                                                    <Ionicons
                                                        name={preference.icon}
                                                        size={12}
                                                        color="#9ca3af"
                                                    />
                                                    <Text style={styles.preferenceTypeText}>
                                                        {preference.type.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Switch
                                            value={preference.enabled}
                                            onValueChange={() => togglePreference(category.id, preference.id)}
                                            trackColor={{ false: '#f3f4f6', true: '#0066A1' }}
                                            thumbColor={preference.enabled ? '#ffffff' : '#ffffff'}
                                            ios_backgroundColor="#f3f4f6"
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}

                {/* Save Button */}
                <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                </TouchableOpacity>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoNoteText}>
                        Changes will take effect immediately. You can modify these settings at any time.
                    </Text>
                </View>
            </ScrollView>
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
    resetButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },
    // Overview Card
    overviewCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 12,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    overviewIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewContent: {
        flex: 1,
    },
    overviewTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    overviewDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    // Category Card
    categoryCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        marginBottom: 16,
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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 2,
    },
    categoryDescription: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    categoryActions: {
        marginLeft: 12,
    },
    toggleAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    toggleAllButtonActive: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    toggleAllButtonInactive: {
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        borderColor: 'rgba(0, 102, 161, 0.2)',
    },
    toggleAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    toggleAllTextActive: {
        color: '#ef4444',
    },
    toggleAllTextInactive: {
        color: '#0066A1',
    },
    // Preferences
    preferencesContainer: {
        padding: 20,
        paddingTop: 0,
        gap: 16,
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    preferenceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    preferenceIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    preferenceContent: {
        flex: 1,
    },
    preferenceTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    preferenceDescription: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
        lineHeight: 18,
    },
    preferenceType: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    preferenceTypeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 0.5,
    },
    // Save Button
    saveButton: {
        marginHorizontal: 24,
        marginTop: 8,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#0066A1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    // Info Note
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginHorizontal: 24,
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoNoteText: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 16,
        flex: 1,
    },
});
