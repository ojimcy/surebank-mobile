/**
 * Notification Settings Screen
 * Professional screen for managing notification preferences with backend integration
 */

import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NestedHeader } from '@/components/navigation';
import type { SettingsScreenProps } from '@/navigation/types';
import notificationsService, { type NotificationChannel, type NotificationPreferences } from '@/services/api/notifications';

// Notification type metadata for better UX
interface NotificationTypeInfo {
    id: string;
    title: string;
    description: string;
    category: 'transactions' | 'packages' | 'security' | 'account' | 'orders' | 'marketing';
    icon: keyof typeof Ionicons.glyphMap;
    recommended: NotificationChannel;
}

// Comprehensive notification types matching backend schema
const NOTIFICATION_TYPES: NotificationTypeInfo[] = [
    // Transaction Notifications
    {
        id: 'transaction_alerts',
        title: 'Transaction Alerts',
        description: 'Receive notifications for all transactions',
        category: 'transactions',
        icon: 'card-outline',
        recommended: 'both',
    },
    {
        id: 'deposit_confirmation',
        title: 'Deposit Confirmations',
        description: 'Get notified when deposits are successful',
        category: 'transactions',
        icon: 'arrow-down-circle-outline',
        recommended: 'both',
    },
    {
        id: 'withdrawal_request',
        title: 'Withdrawal Requests',
        description: 'Notifications for withdrawal requests',
        category: 'transactions',
        icon: 'arrow-up-circle-outline',
        recommended: 'both',
    },
    {
        id: 'withdrawal_approval',
        title: 'Withdrawal Approvals',
        description: 'Alerts when withdrawals are approved',
        category: 'transactions',
        icon: 'checkmark-circle-outline',
        recommended: 'both',
    },
    {
        id: 'withdrawal_success',
        title: 'Withdrawal Success',
        description: 'Confirmation of successful withdrawals',
        category: 'transactions',
        icon: 'checkmark-done-outline',
        recommended: 'both',
    },
    {
        id: 'withdrawal_failed',
        title: 'Withdrawal Failures',
        description: 'Immediate alerts for failed withdrawals',
        category: 'transactions',
        icon: 'close-circle-outline',
        recommended: 'both',
    },
    // Package Notifications
    {
        id: 'package_created',
        title: 'Package Created',
        description: 'Confirmation when new packages are created',
        category: 'packages',
        icon: 'cube-outline',
        recommended: 'both',
    },
    {
        id: 'package_matured',
        title: 'Package Matured',
        description: 'Alerts when packages reach maturity',
        category: 'packages',
        icon: 'trophy-outline',
        recommended: 'both',
    },
    {
        id: 'package_maturity_alert',
        title: 'Maturity Reminders',
        description: 'Reminders before package maturity',
        category: 'packages',
        icon: 'time-outline',
        recommended: 'both',
    },
    {
        id: 'contribution_notification',
        title: 'Contribution Confirmations',
        description: 'Notifications for package contributions',
        category: 'packages',
        icon: 'wallet-outline',
        recommended: 'both',
    },
    {
        id: 'daily_savings',
        title: 'Daily Savings',
        description: 'Updates on daily savings activities',
        category: 'packages',
        icon: 'calendar-outline',
        recommended: 'both',
    },
    {
        id: 'savings_reminders',
        title: 'Savings Reminders',
        description: 'Reminders to make savings contributions',
        category: 'packages',
        icon: 'notifications-outline',
        recommended: 'both',
    },
    // Security Notifications
    {
        id: 'security_alerts',
        title: 'Security Alerts',
        description: 'Critical security notifications',
        category: 'security',
        icon: 'shield-checkmark-outline',
        recommended: 'both',
    },
    {
        id: 'login_alerts',
        title: 'Login Alerts',
        description: 'Notifications for new device logins',
        category: 'security',
        icon: 'log-in-outline',
        recommended: 'both',
    },
    // Account Notifications
    {
        id: 'account_activities',
        title: 'Account Activity',
        description: 'General account activity notifications',
        category: 'account',
        icon: 'person-outline',
        recommended: 'both',
    },
    {
        id: 'kyc_updates',
        title: 'KYC Updates',
        description: 'Verification status updates',
        category: 'account',
        icon: 'document-text-outline',
        recommended: 'both',
    },
    // Order Notifications
    {
        id: 'order_updates',
        title: 'Order Updates',
        description: 'General order status updates',
        category: 'orders',
        icon: 'cart-outline',
        recommended: 'email',
    },
    {
        id: 'order_created',
        title: 'Order Confirmations',
        description: 'Confirmation of new orders',
        category: 'orders',
        icon: 'receipt-outline',
        recommended: 'email',
    },
    {
        id: 'order_payment',
        title: 'Order Payments',
        description: 'Payment confirmation for orders',
        category: 'orders',
        icon: 'card-outline',
        recommended: 'email',
    },
    {
        id: 'order_shipped',
        title: 'Order Shipped',
        description: 'Notifications when orders are shipped',
        category: 'orders',
        icon: 'airplane-outline',
        recommended: 'email',
    },
    {
        id: 'order_delivered',
        title: 'Order Delivered',
        description: 'Confirmation of order delivery',
        category: 'orders',
        icon: 'checkbox-outline',
        recommended: 'email',
    },
    // Marketing
    {
        id: 'marketing_updates',
        title: 'Marketing Updates',
        description: 'Promotional offers and news',
        category: 'marketing',
        icon: 'megaphone-outline',
        recommended: 'email',
    },
];

// Category metadata
const CATEGORIES = {
    transactions: {
        title: 'Transactions',
        description: 'Deposits, withdrawals, and transfers',
        icon: 'swap-horizontal-outline' as keyof typeof Ionicons.glyphMap,
        color: '#10b981',
        backgroundColor: '#ecfdf5',
    },
    packages: {
        title: 'Savings & Packages',
        description: 'Package updates and contributions',
        icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
        color: '#0066A1',
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
    },
    security: {
        title: 'Security',
        description: 'Security alerts and login notifications',
        icon: 'shield-outline' as keyof typeof Ionicons.glyphMap,
        color: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    account: {
        title: 'Account',
        description: 'Account status and verification',
        icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap,
        color: '#8b5cf6',
        backgroundColor: '#f5f3ff',
    },
    orders: {
        title: 'Orders',
        description: 'E-commerce order updates',
        icon: 'bag-outline' as keyof typeof Ionicons.glyphMap,
        color: '#f59e0b',
        backgroundColor: '#fffbeb',
    },
    marketing: {
        title: 'Marketing',
        description: 'Promotions and product updates',
        icon: 'star-outline' as keyof typeof Ionicons.glyphMap,
        color: '#6366f1',
        backgroundColor: '#eef2ff',
    },
};

// Individual channel options for multi-select
type ChannelType = 'in-app' | 'email' | 'sms';

interface ChannelOption {
    value: ChannelType;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
    {
        value: 'in-app',
        label: 'In-App',
        description: 'Push notifications in the app',
        icon: 'phone-portrait-outline',
        color: '#6366f1',
    },
    {
        value: 'email',
        label: 'Email',
        description: 'Email notifications',
        icon: 'mail-outline',
        color: '#0066A1',
    },
    {
        value: 'sms',
        label: 'SMS',
        description: 'Text message alerts',
        icon: 'chatbubble-outline',
        color: '#10b981',
    },
];

// Helper functions to convert between backend format and frontend format
const channelsToString = (channels: ChannelType[]): NotificationChannel => {
    if (channels.length === 0) return 'none';
    if (channels.length === 3) return 'both';
    if (channels.length === 1) return channels[0] as NotificationChannel;
    // For 2 channels, use 'both' (backend interprets this as multiple)
    return 'both';
};

const stringToChannels = (value: NotificationChannel): ChannelType[] => {
    if (value === 'none') return [];
    if (value === 'both') return ['in-app', 'email']; // Default interpretation
    if (value === 'in-app' || value === 'email' || value === 'sms') return [value];
    return ['in-app', 'email']; // Default fallback
};

export default function NotificationSettingsScreen({
    navigation
}: SettingsScreenProps<'NotificationSettings'>) {
    const queryClient = useQueryClient();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [localPreferences, setLocalPreferences] = useState<Record<string, ChannelType[]>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch current preferences
    const {
        data: preferences,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['notification-preferences'],
        queryFn: notificationsService.getPreferences,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (prefs: Partial<NotificationPreferences>) =>
            notificationsService.updatePreferences(prefs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            setHasChanges(false);
            Alert.alert('Success', 'Your notification preferences have been saved.');
        },
        onError: (err: any) => {
            Alert.alert(
                'Error',
                err?.response?.data?.message || 'Failed to save preferences. Please try again.'
            );
        },
    });

    // Initialize local state from API data - convert backend format to frontend format
    useEffect(() => {
        if (preferences?.preferences) {
            const convertedPrefs: Record<string, ChannelType[]> = {};
            Object.entries(preferences.preferences).forEach(([key, value]) => {
                convertedPrefs[key] = stringToChannels(value);
            });
            setLocalPreferences(convertedPrefs);
        }
    }, [preferences]);

    const handleBack = () => {
        if (hasChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to save them before leaving?',
                [
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: handleSave },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const toggleChannel = (typeId: string, channel: ChannelType) => {
        setLocalPreferences(prev => {
            const currentChannels = prev[typeId] || ['in-app', 'email']; // Default
            const isEnabled = currentChannels.includes(channel);

            let newChannels: ChannelType[];
            if (isEnabled) {
                // Remove channel
                newChannels = currentChannels.filter(c => c !== channel);
            } else {
                // Add channel
                newChannels = [...currentChannels, channel];
            }

            return {
                ...prev,
                [typeId]: newChannels,
            };
        });
        setHasChanges(true);
    };

    const handleSave = () => {
        // Convert frontend format (arrays) to backend format (strings)
        const backendPreferences: Record<string, NotificationChannel> = {};
        Object.entries(localPreferences).forEach(([key, channels]) => {
            backendPreferences[key] = channelsToString(channels);
        });

        updateMutation.mutate({
            preferences: backendPreferences,
        });
    };

    const resetToDefaults = () => {
        Alert.alert(
            'Reset to Defaults',
            'This will reset all notification settings to their recommended values. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        const defaults: Record<string, ChannelType[]> = {};
                        NOTIFICATION_TYPES.forEach(type => {
                            // Default to in-app + email for most types
                            defaults[type.id] = type.recommended === 'both'
                                ? ['in-app', 'email']
                                : type.recommended === 'email'
                                    ? ['email']
                                    : ['in-app', 'email'];
                        });
                        setLocalPreferences(defaults);
                        setHasChanges(true);
                    },
                },
            ]
        );
    };

    const toggleCategory = (category: string) => {
        setExpandedCategory(prev => prev === category ? null : category);
    };

    const getCategoryTypes = (category: string) => {
        return NOTIFICATION_TYPES.filter(type => type.category === category);
    };

    const getCategoryChannelCount = (category: string) => {
        const types = getCategoryTypes(category);
        const enabled = types.filter(type => {
            const channels = localPreferences[type.id] || stringToChannels(type.recommended);
            return channels.length > 0;
        }).length;
        return { enabled, total: types.length };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <NestedHeader
                    title="Notification Settings"
                    onBack={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066A1" />
                    <Text style={styles.loadingText}>Loading preferences...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <NestedHeader
                    title="Notification Settings"
                    onBack={() => navigation.goBack()}
                />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Failed to Load Preferences</Text>
                    <Text style={styles.errorMessage}>
                        {(error as any)?.response?.data?.message || 'Please try again later'}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <NestedHeader
                title="Notification Settings"
                onBack={handleBack}
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
                    <View style={styles.overviewIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#0066A1" />
                    </View>
                    <View style={styles.overviewContent}>
                        <Text style={styles.overviewTitle}>Manage Your Notifications</Text>
                        <Text style={styles.overviewDescription}>
                            Choose how you want to receive notifications for different activities
                        </Text>
                    </View>
                </View>

                {/* Channel Legend */}
                <View style={styles.legendCard}>
                    <Text style={styles.legendTitle}>Notification Channels</Text>
                    <View style={styles.legendItems}>
                        {CHANNEL_OPTIONS.slice(0, 4).map(option => (
                            <View key={option.value} style={styles.legendItem}>
                                <View style={styles.legendIconBadge}>
                                    <Ionicons name={option.icon} size={14} color="#0066A1" />
                                </View>
                                <View style={styles.legendTextContainer}>
                                    <Text style={styles.legendLabel}>{option.label}</Text>
                                    <Text style={styles.legendDescription}>{option.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notification Categories */}
                {Object.entries(CATEGORIES).map(([categoryKey, category]) => {
                    const types = getCategoryTypes(categoryKey);
                    if (types.length === 0) return null;

                    const { enabled, total } = getCategoryChannelCount(categoryKey);
                    const isExpanded = expandedCategory === categoryKey;

                    return (
                        <View key={categoryKey} style={styles.categoryCard}>
                            <TouchableOpacity
                                style={styles.categoryHeader}
                                onPress={() => toggleCategory(categoryKey)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.categoryLeft}>
                                    <View style={[
                                        styles.categoryIcon,
                                        { backgroundColor: category.backgroundColor }
                                    ]}>
                                        <Ionicons
                                            name={category.icon}
                                            size={20}
                                            color={category.color}
                                        />
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryTitle}>{category.title}</Text>
                                        <Text style={styles.categoryDescription}>{category.description}</Text>
                                        <Text style={styles.categoryCount}>
                                            {enabled} of {total} enabled
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.typesContainer}>
                                    {types.map(type => {
                                        const currentChannels = localPreferences[type.id] || stringToChannels(type.recommended);

                                        return (
                                            <View key={type.id} style={styles.typeItem}>
                                                <View style={styles.typeHeader}>
                                                    <View style={styles.typeIconContainer}>
                                                        <Ionicons name={type.icon} size={18} color="#6b7280" />
                                                    </View>
                                                    <View style={styles.typeInfo}>
                                                        <Text style={styles.typeTitle}>{type.title}</Text>
                                                        <Text style={styles.typeDescription}>{type.description}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.channelOptions}>
                                                    {CHANNEL_OPTIONS.map(option => {
                                                        const isEnabled = currentChannels.includes(option.value);

                                                        return (
                                                            <TouchableOpacity
                                                                key={option.value}
                                                                style={[
                                                                    styles.channelOption,
                                                                    isEnabled && styles.channelOptionSelected
                                                                ]}
                                                                onPress={() => toggleChannel(type.id, option.value)}
                                                            >
                                                                <View style={[
                                                                    styles.checkbox,
                                                                    isEnabled && styles.checkboxSelected
                                                                ]}>
                                                                    {isEnabled && (
                                                                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                                                                    )}
                                                                </View>
                                                                <Ionicons
                                                                    name={option.icon}
                                                                    size={14}
                                                                    color={isEnabled ? option.color : '#9ca3af'}
                                                                />
                                                                <Text style={[
                                                                    styles.channelOptionText,
                                                                    isEnabled && styles.channelOptionTextSelected
                                                                ]}>
                                                                    {option.label}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Save Button */}
                {hasChanges && (
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, updateMutation.isPending && styles.saveButtonDisabled]}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                                <Text style={styles.saveButtonText}>Save Preferences</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
    },
    errorMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#0066A1',
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
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
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
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
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    overviewDescription: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
    },
    // Legend Card
    legendCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
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
    legendTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 12,
    },
    legendItems: {
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    legendIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendTextContainer: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    legendDescription: {
        fontSize: 11,
        color: '#6b7280',
    },
    // Category Card
    categoryCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
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
        padding: 16,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 2,
    },
    categoryDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '500',
    },
    // Types Container
    typesContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        padding: 16,
        paddingTop: 12,
        gap: 20,
    },
    typeItem: {
        gap: 12,
    },
    typeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    typeIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeInfo: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    typeDescription: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 16,
    },
    // Channel Options
    channelOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingLeft: 44,
    },
    channelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        minWidth: '29%',
    },
    channelOptionSelected: {
        borderColor: '#0066A1',
        backgroundColor: 'rgba(0, 102, 161, 0.05)',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    checkboxSelected: {
        borderColor: '#0066A1',
        backgroundColor: '#0066A1',
    },
    channelOptionText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
    },
    channelOptionTextSelected: {
        color: '#0066A1',
        fontWeight: '600',
    },
    // Save Button
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#0066A1',
    },
    saveButtonDisabled: {
        opacity: 0.6,
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
        marginHorizontal: 16,
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
