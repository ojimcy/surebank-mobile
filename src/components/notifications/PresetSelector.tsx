/**
 * Preset Selector Component
 *
 * Allows users to quickly choose from predefined notification presets
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type NotificationPreset = 'minimal' | 'balanced' | 'everything' | 'custom';

interface PresetOption {
  value: NotificationPreset;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
  color: string;
  recommended?: boolean;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    value: 'minimal',
    name: 'Minimal',
    description: 'Only critical security and transaction alerts',
    icon: 'notifications-off-outline',
    features: [
      'Security alerts',
      'Failed transactions',
      'Successful withdrawals',
    ],
    color: '#6b7280',
  },
  {
    value: 'balanced',
    name: 'Balanced',
    description: 'All transactions, packages, and security (Recommended)',
    icon: 'notifications-outline',
    features: [
      'All financial notifications',
      'Package updates',
      'Security alerts',
      'No marketing',
    ],
    color: '#0066A1',
    recommended: true,
  },
  {
    value: 'everything',
    name: 'Everything',
    description: 'All notifications including marketing',
    icon: 'notifications',
    features: [
      'All notifications',
      'Marketing updates',
      'Promotional offers',
    ],
    color: '#10b981',
  },
];

interface PresetSelectorProps {
  selectedPreset: NotificationPreset;
  onSelectPreset: (preset: NotificationPreset) => void;
  disabled?: boolean;
}

export default function PresetSelector({
  selectedPreset,
  onSelectPreset,
  disabled = false,
}: PresetSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Setup</Text>
        <Text style={styles.subtitle}>
          Choose a preset to get started quickly, or customize individual settings below
        </Text>
      </View>

      <View style={styles.presetsContainer}>
        {PRESET_OPTIONS.map((preset) => {
          const isSelected = selectedPreset === preset.value;

          return (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetCard,
                isSelected && styles.presetCardSelected,
                disabled && styles.presetCardDisabled,
              ]}
              onPress={() => !disabled && onSelectPreset(preset.value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              {/* Header with Icon and Radio */}
              <View style={styles.presetHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && { backgroundColor: `${preset.color}15` },
                  ]}
                >
                  <Ionicons
                    name={preset.icon}
                    size={24}
                    color={isSelected ? preset.color : '#6b7280'}
                  />
                </View>

                <View style={styles.presetHeaderText}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                      {preset.name}
                    </Text>
                    {preset.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  {selectedPreset === 'custom' && preset.value === 'balanced' && (
                    <Text style={styles.customNote}>Currently using custom settings</Text>
                  )}
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
              </View>

              {/* Description */}
              <Text style={styles.presetDescription}>{preset.description}</Text>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {preset.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={isSelected ? preset.color : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        isSelected && { color: '#212529' },
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Indicator */}
      {selectedPreset === 'custom' && (
        <View style={styles.customIndicator}>
          <Ionicons name="options-outline" size={20} color="#6366f1" />
          <Text style={styles.customIndicatorText}>
            You&apos;re using custom notification settings
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  presetsContainer: {
    gap: 12,
  },
  presetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  presetCardSelected: {
    borderColor: '#0066A1',
    backgroundColor: 'rgba(0, 102, 161, 0.02)',
  },
  presetCardDisabled: {
    opacity: 0.5,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetHeaderText: {
    flex: 1,
  },
  nameRow: {
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
  presetNameSelected: {
    color: '#212529',
  },
  recommendedBadge: {
    backgroundColor: '#0066A1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  customNote: {
    fontSize: 11,
    color: '#6366f1',
    fontStyle: 'italic',
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
  presetDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  featuresContainer: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
  },
  customIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  customIndicatorText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
    flex: 1,
  },
});
