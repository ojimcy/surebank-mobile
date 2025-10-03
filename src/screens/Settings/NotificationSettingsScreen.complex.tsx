/**
 * Notification Settings Screen - Hybrid Approach
 *
 * Features:
 * 1. Quick preset selection (Minimal, Balanced, Everything)
 * 2. Category-level controls (6 categories)
 * 3. Advanced granular settings (22 notification types)
 * Progressive disclosure: Simple by default, powerful when needed
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NestedHeader } from '@/components/navigation';
import PresetSelector, {
  type NotificationPreset,
} from '@/components/notifications/PresetSelector';
import CategoryControl, {
  CATEGORIES,
  type ChannelType,
} from '@/components/notifications/CategoryControl';
import type { SettingsScreenProps } from '@/navigation/types';
import notificationsService, {
  type NotificationChannel,
  type NotificationPreferences,
} from '@/services/api/notifications';

// Notification type metadata (for advanced mode)
interface NotificationTypeInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// All notification types grouped by category
const NOTIFICATION_TYPES: Record<string, NotificationTypeInfo[]> = {
  transactions: [
    {
      id: 'transaction_alerts',
      title: 'Transaction Alerts',
      description: 'All transactions',
      category: 'transactions',
      icon: 'card-outline',
    },
    {
      id: 'deposit_confirmation',
      title: 'Deposit Confirmations',
      description: 'Successful deposits',
      category: 'transactions',
      icon: 'arrow-down-circle-outline',
    },
    {
      id: 'withdrawal_request',
      title: 'Withdrawal Requests',
      description: 'Withdrawal requests',
      category: 'transactions',
      icon: 'arrow-up-circle-outline',
    },
    {
      id: 'withdrawal_approval',
      title: 'Withdrawal Approvals',
      description: 'Approved withdrawals',
      category: 'transactions',
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'withdrawal_success',
      title: 'Withdrawal Success',
      description: 'Successful withdrawals',
      category: 'transactions',
      icon: 'checkmark-done-outline',
    },
    {
      id: 'withdrawal_failed',
      title: 'Withdrawal Failures',
      description: 'Failed withdrawals',
      category: 'transactions',
      icon: 'close-circle-outline',
    },
  ],
  packages: [
    {
      id: 'package_created',
      title: 'Package Created',
      description: 'New packages',
      category: 'packages',
      icon: 'cube-outline',
    },
    {
      id: 'package_matured',
      title: 'Package Matured',
      description: 'Mature packages',
      category: 'packages',
      icon: 'trophy-outline',
    },
    {
      id: 'package_maturity_alert',
      title: 'Maturity Reminders',
      description: 'Upcoming maturity',
      category: 'packages',
      icon: 'time-outline',
    },
    {
      id: 'contribution_notification',
      title: 'Contribution Confirmations',
      description: 'Package contributions',
      category: 'packages',
      icon: 'wallet-outline',
    },
    {
      id: 'daily_savings',
      title: 'Daily Savings',
      description: 'Daily savings activities',
      category: 'packages',
      icon: 'calendar-outline',
    },
    {
      id: 'savings_reminders',
      title: 'Savings Reminders',
      description: 'Contribution reminders',
      category: 'packages',
      icon: 'notifications-outline',
    },
  ],
  security: [
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Critical security',
      category: 'security',
      icon: 'shield-checkmark-outline',
    },
    {
      id: 'login_alerts',
      title: 'Login Alerts',
      description: 'New device logins',
      category: 'security',
      icon: 'log-in-outline',
    },
  ],
  account: [
    {
      id: 'account_activities',
      title: 'Account Activity',
      description: 'General account activity',
      category: 'account',
      icon: 'person-outline',
    },
    {
      id: 'kyc_updates',
      title: 'KYC Updates',
      description: 'Verification status',
      category: 'account',
      icon: 'document-text-outline',
    },
  ],
  orders: [
    {
      id: 'order_updates',
      title: 'Order Updates',
      description: 'General order status',
      category: 'orders',
      icon: 'cart-outline',
    },
    {
      id: 'order_created',
      title: 'Order Confirmations',
      description: 'New orders',
      category: 'orders',
      icon: 'receipt-outline',
    },
    {
      id: 'order_payment',
      title: 'Order Payments',
      description: 'Payment confirmations',
      category: 'orders',
      icon: 'card-outline',
    },
    {
      id: 'order_shipped',
      title: 'Order Shipped',
      description: 'Shipped orders',
      category: 'orders',
      icon: 'airplane-outline',
    },
    {
      id: 'order_delivered',
      title: 'Order Delivered',
      description: 'Delivered orders',
      category: 'orders',
      icon: 'checkbox-outline',
    },
  ],
  marketing: [
    {
      id: 'marketing_updates',
      title: 'Marketing Updates',
      description: 'Promotions and news',
      category: 'marketing',
      icon: 'megaphone-outline',
    },
  ],
};

// Helper: Convert backend string to frontend array
const stringToChannels = (value: NotificationChannel): ChannelType[] => {
  if (value === 'none') return [];
  if (value === 'both') return ['in-app', 'email'];
  if (value === 'in-app' || value === 'email' || value === 'sms') return [value];
  return ['in-app', 'email'];
};

// Helper: Convert frontend array to backend string
const channelsToString = (channels: ChannelType[]): NotificationChannel => {
  if (channels.length === 0) return 'none';
  if (channels.length === 3) return 'both';
  if (channels.length === 1) return channels[0] as NotificationChannel;
  return 'both';
};

// Helper: Get category channels from preferences
const getCategoryChannels = (
  preferences: Record<string, NotificationChannel>,
  category: string
): ChannelType[] => {
  const types = NOTIFICATION_TYPES[category] || [];
  if (types.length === 0) return [];

  // Get most common channel setting in the category
  const channelCounts: Record<string, number> = {};
  types.forEach((type) => {
    const channels = stringToChannels(preferences[type.id] || 'both');
    channels.forEach((ch) => {
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    });
  });

  // Return channels that are enabled for majority of types
  const threshold = types.length / 2;
  return Object.entries(channelCounts)
    .filter(([_, count]) => count >= threshold)
    .map(([channel]) => channel as ChannelType);
};

// Helper: Get enabled count in category
const getCategoryEnabledCount = (
  preferences: Record<string, NotificationChannel>,
  category: string
): { enabled: number; total: number } => {
  const types = NOTIFICATION_TYPES[category] || [];
  const enabled = types.filter((type) => {
    const channels = stringToChannels(preferences[type.id] || 'both');
    return channels.length > 0;
  }).length;
  return { enabled, total: types.length };
};

export default function NotificationSettingsScreen({
  navigation,
}: SettingsScreenProps<'NotificationSettings'>) {
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedAdvancedCategory, setExpandedAdvancedCategory] = useState<string | null>(null);
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

  // Apply preset mutation
  const applyPresetMutation = useMutation({
    mutationFn: (preset: 'minimal' | 'balanced' | 'everything') =>
      notificationsService.applyPreset(preset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
      Alert.alert('Success', 'Preset applied successfully!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to apply preset');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ category, channels }: { category: string; channels: ChannelType[] }) =>
      notificationsService.updateCategoryPreferences(category, channels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update category');
    },
  });

  // Update individual preference mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      notificationsService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
      Alert.alert('Success', 'Preferences saved successfully!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save preferences');
    },
  });

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handlePresetChange = (preset: NotificationPreset) => {
    if (preset === 'custom') {
      setShowAdvanced(true);
      return;
    }

    Alert.alert(
      'Apply Preset',
      `Apply the "${preset}" preset? This will update all your notification settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => applyPresetMutation.mutate(preset),
        },
      ]
    );
  };

  const handleCategoryChannelToggle = (category: string, channel: ChannelType) => {
    if (!preferences) return;

    const currentChannels = getCategoryChannels(preferences.preferences, category);
    const isEnabled = currentChannels.includes(channel);

    const newChannels = isEnabled
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    // Don't allow disabling all channels for security
    if (category === 'security' && newChannels.length === 0) {
      Alert.alert(
        'Security Required',
        'Security notifications cannot be completely disabled for your protection.'
      );
      return;
    }

    updateCategoryMutation.mutate({ category, channels: newChannels });
  };

  const handleAdvancedChannelToggle = (typeId: string, channel: ChannelType) => {
    if (!preferences) return;

    const currentChannels = stringToChannels(preferences.preferences[typeId] || 'both');
    const isEnabled = currentChannels.includes(channel);

    const newChannels = isEnabled
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    const newPreferences = {
      preferences: {
        ...preferences.preferences,
        [typeId]: channelsToString(newChannels),
      },
    };

    updatePreferencesMutation.mutate(newPreferences);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NestedHeader title="Notification Settings" onBack={() => navigation.goBack()} />
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
        <NestedHeader title="Notification Settings" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>
            {(error as any)?.response?.data?.message || 'Please try again'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
            }
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPreset = (preferences?.preset || 'balanced') as NotificationPreset;

  return (
    <SafeAreaView style={styles.container}>
      <NestedHeader
        title="Notification Settings"
        onBack={handleBack}
        rightComponent={
          showAdvanced && (
            <TouchableOpacity onPress={() => setShowAdvanced(false)}>
              <Text style={styles.headerButton}>Simple</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preset Selector */}
        {!showAdvanced && (
          <View style={styles.section}>
            <PresetSelector
              selectedPreset={currentPreset}
              onSelectPreset={handlePresetChange}
              disabled={applyPresetMutation.isPending}
            />
          </View>
        )}

        {/* Category Controls */}
        {!showAdvanced && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customize by Category</Text>
              <Text style={styles.sectionSubtitle}>
                Fine-tune which channels you want for each category
              </Text>
            </View>

            {Object.entries(CATEGORIES).map(([categoryKey, category]) => (
              <CategoryControl
                key={categoryKey}
                category={category}
                enabledChannels={getCategoryChannels(
                  preferences?.preferences || {},
                  categoryKey
                )}
                notificationCount={getCategoryEnabledCount(
                  preferences?.preferences || {},
                  categoryKey
                )}
                onToggleChannel={(channel) =>
                  handleCategoryChannelToggle(categoryKey, channel)
                }
                onExpandCategory={() =>
                  setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)
                }
                isExpanded={expandedCategory === categoryKey}
                isLocked={categoryKey === 'security'}
              />
            ))}
          </View>
        )}

        {/* Advanced Mode Link */}
        {!showAdvanced && (
          <TouchableOpacity
            style={styles.advancedLink}
            onPress={() => setShowAdvanced(true)}
          >
            <Ionicons name="settings-outline" size={20} color="#0066A1" />
            <Text style={styles.advancedLinkText}>Advanced Settings</Text>
            <Text style={styles.advancedLinkSubtext}>
              Configure individual notification types
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#0066A1" />
          </TouchableOpacity>
        )}

        {/* Advanced Mode - Individual Notification Types */}
        {showAdvanced && (
          <View style={styles.section}>
            <View style={styles.advancedHeader}>
              <Ionicons name="options-outline" size={24} color="#0066A1" />
              <View style={styles.advancedHeaderText}>
                <Text style={styles.advancedTitle}>Advanced Settings</Text>
                <Text style={styles.advancedSubtitle}>
                  Configure each notification type individually
                </Text>
              </View>
            </View>

            {Object.entries(NOTIFICATION_TYPES).map(([categoryKey, types]) => {
              const category = CATEGORIES[categoryKey];
              const isExpanded = expandedAdvancedCategory === categoryKey;

              return (
                <View key={categoryKey} style={styles.advancedCategory}>
                  <TouchableOpacity
                    style={styles.advancedCategoryHeader}
                    onPress={() =>
                      setExpandedAdvancedCategory(isExpanded ? null : categoryKey)
                    }
                  >
                    <View style={styles.advancedCategoryLeft}>
                      <View
                        style={[
                          styles.advancedCategoryIcon,
                          { backgroundColor: category.backgroundColor },
                        ]}
                      >
                        <Ionicons name={category.icon} size={18} color={category.color} />
                      </View>
                      <Text style={styles.advancedCategoryTitle}>{category.title}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>

                  {isExpanded &&
                    types.map((type) => {
                      const currentChannels = stringToChannels(
                        preferences?.preferences[type.id] || 'both'
                      );

                      return (
                        <View key={type.id} style={styles.advancedTypeItem}>
                          <View style={styles.advancedTypeHeader}>
                            <Ionicons name={type.icon} size={18} color="#6b7280" />
                            <View style={styles.advancedTypeInfo}>
                              <Text style={styles.advancedTypeTitle}>{type.title}</Text>
                              <Text style={styles.advancedTypeDescription}>
                                {type.description}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.advancedChannelOptions}>
                            {(['in-app', 'email', 'sms'] as ChannelType[]).map((channel) => {
                              const isEnabled = currentChannels.includes(channel);

                              return (
                                <TouchableOpacity
                                  key={channel}
                                  style={[
                                    styles.advancedChannelOption,
                                    isEnabled && styles.advancedChannelOptionSelected,
                                  ]}
                                  onPress={() => handleAdvancedChannelToggle(type.id, channel)}
                                >
                                  <View
                                    style={[
                                      styles.checkbox,
                                      isEnabled && styles.checkboxSelected,
                                    ]}
                                  >
                                    {isEnabled && (
                                      <Ionicons name="checkmark" size={10} color="#ffffff" />
                                    )}
                                  </View>
                                  <Text
                                    style={[
                                      styles.advancedChannelText,
                                      isEnabled && styles.advancedChannelTextSelected,
                                    ]}
                                  >
                                    {channel}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                </View>
              );
            })}
          </View>
        )}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
          <Text style={styles.infoNoteText}>
            Changes take effect immediately. Security notifications are always enabled.
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
    padding: 16,
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
  headerButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066A1',
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  advancedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  advancedLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0066A1',
    flex: 1,
  },
  advancedLinkSubtext: {
    fontSize: 12,
    color: '#6b7280',
    position: 'absolute',
    bottom: 12,
    left: 52,
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
  },
  advancedHeaderText: {
    flex: 1,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  advancedSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  advancedCategory: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  advancedCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  advancedCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advancedCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  advancedTypeItem: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  advancedTypeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  advancedTypeInfo: {
    flex: 1,
  },
  advancedTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  advancedTypeDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  advancedChannelOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 30,
  },
  advancedChannelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  advancedChannelOptionSelected: {
    borderColor: '#0066A1',
    backgroundColor: 'rgba(0, 102, 161, 0.05)',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
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
  advancedChannelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  advancedChannelTextSelected: {
    color: '#0066A1',
    fontWeight: '600',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
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
