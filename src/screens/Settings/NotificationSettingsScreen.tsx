/**
 * Notification Settings Screen - Simplified Hybrid Approach
 * Simple and reliable implementation
 */

import React, { useState } from 'react';
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
import type { SettingsScreenProps } from '@/navigation/types';
import notificationsService, {
  type NotificationChannel,
  type ChannelType,
} from '@/services/api/notifications';

// Preset options
const PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Only critical alerts',
    icon: 'notifications-off-outline' as const,
    color: '#6b7280',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Recommended settings',
    icon: 'notifications-outline' as const,
    color: '#0066A1',
    recommended: true,
  },
  {
    id: 'everything',
    name: 'Everything',
    description: 'All notifications',
    icon: 'notifications' as const,
    color: '#10b981',
  },
];

// Categories
const CATEGORIES = [
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Deposits, withdrawals, transfers',
    icon: 'swap-horizontal-outline' as const,
    color: '#10b981',
  },
  {
    id: 'packages',
    name: 'Savings & Packages',
    description: 'Package updates',
    icon: 'briefcase-outline' as const,
    color: '#0066A1',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security alerts',
    icon: 'shield-outline' as const,
    color: '#ef4444',
    locked: true,
  },
  {
    id: 'account',
    name: 'Account',
    description: 'Account status',
    icon: 'person-circle-outline' as const,
    color: '#8b5cf6',
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Order updates',
    icon: 'bag-outline' as const,
    color: '#f59e0b',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Promotions',
    icon: 'star-outline' as const,
    color: '#6366f1',
  },
];

export default function NotificationSettingsScreen({
  navigation,
}: SettingsScreenProps<'NotificationSettings'>) {
  const queryClient = useQueryClient();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch preferences
  const { data: preferences, isLoading, isError } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      console.log('📱 Fetching notification preferences...');
      const result = await notificationsService.getPreferences();
      console.log('✅ Preferences loaded:', result.preset);
      return result;
    },
  });

  // Apply preset mutation
  const applyPresetMutation = useMutation({
    mutationFn: async (preset: 'minimal' | 'balanced' | 'everything') => {
      console.log('🔄 Applying preset:', preset);
      const result = await notificationsService.applyPreset(preset);
      console.log('✅ Preset applied successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      Alert.alert('Success', 'Preset applied!');
    },
    onError: (error: any) => {
      console.error('❌ Failed to apply preset:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to apply preset');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ category, channels }: { category: string; channels: ChannelType[] }) => {
      console.log('🔄 Updating category:', category, 'channels:', channels);
      const result = await notificationsService.updateCategoryPreferences(category, channels);
      console.log('✅ Category updated successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error: any) => {
      console.error('❌ Failed to update category:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update category');
    },
  });

  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'custom') return;

    Alert.alert(
      'Apply Preset',
      `Apply "${presetId}" preset?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => applyPresetMutation.mutate(presetId as any),
        },
      ]
    );
  };

  const toggleCategoryChannel = (categoryId: string, channel: ChannelType) => {
    // Simple toggle - if any notification in category has this channel, we remove it, otherwise add it
    const currentChannels: ChannelType[] = ['in-app', 'email']; // Default for now
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    updateCategoryMutation.mutate({ category: categoryId, channels: newChannels });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NestedHeader title="Notification Settings" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066A1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <NestedHeader title="Notification Settings" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load preferences</Text>
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

  const currentPreset = preferences?.preset || 'balanced';

  return (
    <SafeAreaView style={styles.container}>
      <NestedHeader title="Notification Settings" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quick Setup Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Setup</Text>
          <Text style={styles.headerSubtitle}>Choose a preset to get started</Text>
        </View>

        {/* Presets */}
        <View style={styles.presetsContainer}>
          {PRESETS.map((preset) => {
            const isSelected = currentPreset === preset.id;

            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                onPress={() => handlePresetSelect(preset.id)}
              >
                <View style={styles.presetLeft}>
                  <View
                    style={[
                      styles.presetIcon,
                      { backgroundColor: isSelected ? `${preset.color}15` : '#f3f4f6' },
                    ]}
                  >
                    <Ionicons
                      name={preset.icon}
                      size={24}
                      color={isSelected ? preset.color : '#6b7280'}
                    />
                  </View>
                  <View style={styles.presetInfo}>
                    <View style={styles.presetNameRow}>
                      <Text
                        style={[styles.presetName, isSelected && { color: preset.color }]}
                      >
                        {preset.name}
                      </Text>
                      {preset.recommended && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Recommended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.presetDescription}>{preset.description}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    isSelected && { borderColor: preset.color },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioDot, { backgroundColor: preset.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Indicator */}
        {currentPreset === 'custom' && (
          <View style={styles.customBanner}>
            <Ionicons name="options-outline" size={20} color="#6366f1" />
            <Text style={styles.customBannerText}>Using custom settings</Text>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Customize by Category</Text>
          <Text style={styles.sectionSubtitle}>
            Fine-tune notifications for each category
          </Text>
        </View>

        {/* Category Cards */}
        {CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.id;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <View style={styles.categoryLeft}>
                  <View
                    style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}
                  >
                    <Ionicons name={category.icon} size={20} color={category.color} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryNameRow}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.locked && (
                        <Ionicons name="lock-closed" size={14} color="#6b7280" />
                      )}
                    </View>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {/* Channel Toggles */}
              {isExpanded && (
                <View style={styles.channelToggles}>
                  {(['in-app', 'email', 'sms'] as ChannelType[]).map((channel) => (
                    <TouchableOpacity
                      key={channel}
                      style={styles.channelToggle}
                      onPress={() => toggleCategoryChannel(category.id, channel)}
                      disabled={category.locked}
                    >
                      <View style={styles.checkbox}>
                        <Ionicons name="checkmark" size={12} color="#0066A1" />
                      </View>
                      <Ionicons
                        name={
                          channel === 'in-app'
                            ? 'phone-portrait-outline'
                            : channel === 'email'
                            ? 'mail-outline'
                            : 'chatbubble-outline'
                        }
                        size={16}
                        color={category.color}
                      />
                      <Text style={styles.channelLabel}>{channel}</Text>
                    </TouchableOpacity>
                  ))}
                  {category.locked && (
                    <Text style={styles.lockedNote}>
                      Security notifications are always enabled
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  presetsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  presetCardSelected: {
    borderColor: '#0066A1',
    backgroundColor: 'rgba(0, 102, 161, 0.02)',
  },
  presetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetInfo: {
    flex: 1,
  },
  presetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  badge: {
    backgroundColor: '#0066A1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  presetDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    marginBottom: 24,
  },
  customBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6366f1',
  },
  categoriesHeader: {
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
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
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
    gap: 12,
    flex: 1,
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
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  channelToggles: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  channelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0066A1',
    backgroundColor: '#0066A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    textTransform: 'capitalize',
  },
  lockedNote: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    lineHeight: 16,
  },
});
