/**
 * Category Control Component
 *
 * Provides category-level control over notification preferences
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ChannelType = 'in-app' | 'email' | 'sms';

interface CategoryInfo {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  transactions: {
    id: 'transactions',
    title: 'Transactions',
    description: 'Deposits, withdrawals, and transfers',
    icon: 'swap-horizontal-outline',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  packages: {
    id: 'packages',
    title: 'Savings & Packages',
    description: 'Package updates and contributions',
    icon: 'briefcase-outline',
    color: '#0066A1',
    backgroundColor: 'rgba(0, 102, 161, 0.1)',
  },
  security: {
    id: 'security',
    title: 'Security',
    description: 'Security alerts and login notifications',
    icon: 'shield-outline',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  account: {
    id: 'account',
    title: 'Account',
    description: 'Account status and verification',
    icon: 'person-circle-outline',
    color: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  orders: {
    id: 'orders',
    title: 'Orders',
    description: 'E-commerce order updates',
    icon: 'bag-outline',
    color: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  marketing: {
    id: 'marketing',
    title: 'Marketing',
    description: 'Promotions and product updates',
    icon: 'star-outline',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
  },
};

interface ChannelOption {
  value: ChannelType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: 'in-app', label: 'In-App', icon: 'phone-portrait-outline' },
  { value: 'email', label: 'Email', icon: 'mail-outline' },
  { value: 'sms', label: 'SMS', icon: 'chatbubble-outline' },
];

interface CategoryControlProps {
  category: CategoryInfo;
  enabledChannels: ChannelType[];
  notificationCount: { enabled: number; total: number };
  onToggleChannel: (channel: ChannelType) => void;
  onExpandCategory: () => void;
  isExpanded: boolean;
  isLocked?: boolean;
}

export default function CategoryControl({
  category,
  enabledChannels,
  notificationCount,
  onToggleChannel,
  onExpandCategory,
  isExpanded,
  isLocked = false,
}: CategoryControlProps) {
  const allChannelsEnabled = enabledChannels.length === 3;
  const noChannelsEnabled = enabledChannels.length === 0;

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onExpandCategory}
        activeOpacity={0.7}
        disabled={isLocked}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: category.backgroundColor },
            ]}
          >
            <Ionicons name={category.icon} size={20} color={category.color} />
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{category.title}</Text>
              {isLocked && (
                <Ionicons name="lock-closed" size={14} color="#6b7280" />
              )}
            </View>
            <Text style={styles.description}>{category.description}</Text>
            <Text style={styles.count}>
              {notificationCount.enabled} of {notificationCount.total} enabled
            </Text>
          </View>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {/* Channel Toggles (Expanded) */}
      {isExpanded && (
        <View style={styles.channelsContainer}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                CHANNEL_OPTIONS.forEach((channel) => {
                  if (!enabledChannels.includes(channel.value)) {
                    onToggleChannel(channel.value);
                  }
                });
              }}
              disabled={allChannelsEnabled || isLocked}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={14}
                color={allChannelsEnabled ? '#9ca3af' : category.color}
              />
              <Text
                style={[
                  styles.quickActionText,
                  allChannelsEnabled && styles.quickActionTextDisabled,
                ]}
              >
                Enable All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                CHANNEL_OPTIONS.forEach((channel) => {
                  if (enabledChannels.includes(channel.value)) {
                    onToggleChannel(channel.value);
                  }
                });
              }}
              disabled={noChannelsEnabled || isLocked}
            >
              <Ionicons
                name="close-circle-outline"
                size={14}
                color={noChannelsEnabled ? '#9ca3af' : '#ef4444'}
              />
              <Text
                style={[
                  styles.quickActionText,
                  noChannelsEnabled && styles.quickActionTextDisabled,
                ]}
              >
                Disable All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Individual Channel Toggles */}
          <View style={styles.channelToggles}>
            {CHANNEL_OPTIONS.map((channel) => {
              const isEnabled = enabledChannels.includes(channel.value);

              return (
                <TouchableOpacity
                  key={channel.value}
                  style={[
                    styles.channelToggle,
                    isEnabled && styles.channelToggleEnabled,
                  ]}
                  onPress={() => onToggleChannel(channel.value)}
                  disabled={isLocked}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isEnabled && [
                        styles.checkboxEnabled,
                        { backgroundColor: category.color, borderColor: category.color },
                      ],
                    ]}
                  >
                    {isEnabled && (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    )}
                  </View>
                  <Ionicons
                    name={channel.icon}
                    size={16}
                    color={isEnabled ? category.color : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.channelLabel,
                      isEnabled && { color: category.color, fontWeight: '600' },
                    ]}
                  >
                    {channel.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Locked Message */}
          {isLocked && (
            <View style={styles.lockedMessage}>
              <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.lockedMessageText}>
                Security notifications are always enabled for your protection
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  count: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  channelsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 16,
    gap: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  quickActionTextDisabled: {
    color: '#9ca3af',
  },
  channelToggles: {
    gap: 10,
  },
  channelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  channelToggleEnabled: {
    backgroundColor: 'rgba(0, 102, 161, 0.03)',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxEnabled: {
    borderColor: '#0066A1',
    backgroundColor: '#0066A1',
  },
  channelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  lockedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginTop: 4,
  },
  lockedMessageText: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    lineHeight: 15,
  },
});
