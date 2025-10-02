/**
 * Theme Settings Screen
 * Allows users to customize the app appearance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SettingsScreenProps } from '@/navigation/types';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeSettingsScreen({ navigation }: SettingsScreenProps<'Theme'>) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('light');
  const [useSystemTheme, setUseSystemTheme] = useState(false);

  const handleThemeSelect = (theme: ThemeMode) => {
    setSelectedTheme(theme);
    if (theme === 'system') {
      setUseSystemTheme(true);
    } else {
      setUseSystemTheme(false);
    }
    // TODO: Implement theme context to apply theme globally
    console.log('Theme changed to:', theme);
  };

  const themeOptions = [
    {
      id: 'light',
      title: 'Light Mode',
      description: 'Classic bright appearance',
      icon: 'sunny-outline' as const,
      color: '#FDB022',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Easy on the eyes in low light',
      icon: 'moon-outline' as const,
      color: '#6366f1',
    },
    {
      id: 'system',
      title: 'System Default',
      description: 'Automatically match your device settings',
      icon: 'phone-portrait-outline' as const,
      color: '#0066A1',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Ionicons name="color-palette-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>Customize Your Experience</Text>
          <Text style={styles.headerDescription}>
            Choose your preferred theme to personalize the app appearance
          </Text>
        </View>

        {/* Current Theme Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Theme</Text>
          <View style={styles.currentThemeCard}>
            <View style={styles.currentThemeLeft}>
              <View style={[styles.themeIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="sunny-outline" size={24} color="#0066A1" />
              </View>
              <View>
                <Text style={styles.currentThemeTitle}>Light Mode</Text>
                <Text style={styles.currentThemeSubtitle}>Active</Text>
              </View>
            </View>
            <View style={styles.activeIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#28A745" />
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
          {themeOptions.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeOption,
                selectedTheme === theme.id && styles.themeOptionActive,
              ]}
              onPress={() => handleThemeSelect(theme.id as ThemeMode)}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionLeft}>
                <View
                  style={[
                    styles.themeIconContainer,
                    {
                      backgroundColor:
                        selectedTheme === theme.id
                          ? `${theme.color}15`
                          : '#f3f4f6',
                    },
                  ]}
                >
                  <Ionicons
                    name={theme.icon}
                    size={24}
                    color={selectedTheme === theme.id ? theme.color : '#6b7280'}
                  />
                </View>
                <View style={styles.themeOptionContent}>
                  <Text
                    style={[
                      styles.themeOptionTitle,
                      selectedTheme === theme.id && styles.themeOptionTitleActive,
                    ]}
                  >
                    {theme.title}
                  </Text>
                  <Text style={styles.themeOptionDescription}>{theme.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedTheme === theme.id && styles.radioButtonActive,
                ]}
              >
                {selectedTheme === theme.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Options</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Ionicons name="contrast-outline" size={20} color="#6b7280" />
              <View style={styles.settingRowContent}>
                <Text style={styles.settingRowTitle}>High Contrast</Text>
                <Text style={styles.settingRowDescription}>
                  Increase contrast for better visibility
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              onValueChange={() => console.log('High contrast toggled')}
              trackColor={{ false: '#d1d5db', true: '#0066A1' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Ionicons name="text-outline" size={20} color="#6b7280" />
              <View style={styles.settingRowContent}>
                <Text style={styles.settingRowTitle}>Large Text</Text>
                <Text style={styles.settingRowDescription}>
                  Use larger font sizes throughout the app
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              onValueChange={() => console.log('Large text toggled')}
              trackColor={{ false: '#d1d5db', true: '#0066A1' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
          <Text style={styles.infoText}>
            Dark mode is coming soon! We're working on a beautiful dark theme for the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  currentThemeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#28A745',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  currentThemeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentThemeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currentThemeSubtitle: {
    fontSize: 13,
    color: '#28A745',
    fontWeight: '500',
  },
  activeIndicator: {
    marginLeft: 'auto',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  themeOptionActive: {
    borderColor: '#0066A1',
    backgroundColor: '#f0f9ff',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  themeOptionTitleActive: {
    color: '#0066A1',
  },
  themeOptionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: '#0066A1',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066A1',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRowContent: {
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingRowDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
