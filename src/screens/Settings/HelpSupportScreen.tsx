/**
 * Help & Support Screen
 * Provides FAQ, contact options, and support resources
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SettingsScreenProps } from '@/navigation/types';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

export default function HelpSupportScreen({ navigation }: SettingsScreenProps<'Help'>) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'account',
      question: 'How do I verify my account?',
      answer:
        'To verify your account, go to Settings > KYC & Verification. You will need to provide a valid government-issued ID and complete the verification process. Verification typically takes 24-48 hours.',
    },
    {
      id: 'deposit',
      question: 'How do I deposit funds?',
      answer:
        'You can deposit funds by tapping the Deposit button on your Dashboard. Choose your preferred payment method (card, bank transfer, or wallet) and follow the instructions. Deposits are usually instant.',
    },
    {
      id: 'withdraw',
      question: 'How long do withdrawals take?',
      answer:
        'Withdrawals are typically processed within 24 hours on business days. Bank transfers may take 1-3 business days to reflect in your account depending on your bank.',
    },
    {
      id: 'security',
      question: 'Is my money safe?',
      answer:
        'Yes, SureBank uses bank-level security with 256-bit encryption. Your funds are held in licensed financial institutions, and we never store your card CVV or full card numbers.',
    },
    {
      id: 'package',
      question: 'What are the different package types?',
      answer:
        'SureBank offers three package types: Daily Savings (DS) for flexible daily contributions, Investment-Based Savings (IBS) for higher returns with investment options, and Secure Box (SB) for goal-based savings with locked periods.',
    },
    {
      id: 'fees',
      question: 'What fees does SureBank charge?',
      answer:
        'SureBank charges minimal transaction fees. Deposits are free, withdrawals have a small processing fee depending on the amount. There are no monthly maintenance fees or hidden charges.',
    },
    {
      id: 'password',
      question: 'I forgot my password, what should I do?',
      answer:
        'On the login screen, tap "Forgot Password?" and enter your email or phone number. You will receive a verification code to reset your password. If you still have issues, contact support.',
    },
    {
      id: 'statement',
      question: 'How do I get my account statement?',
      answer:
        'Account statements can be downloaded from Settings > Statements. You can choose the date range and format (PDF or Excel) for your statement.',
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@surebank.com',
      icon: 'mail-outline',
      color: '#0066A1',
      action: () => {
        Linking.openURL('mailto:support@surebank.com?subject=Support Request').catch(() => {
          Alert.alert('Error', 'Could not open email app');
        });
      },
    },
    {
      id: 'phone',
      title: 'Call Us',
      description: '+234 800 123 4567',
      icon: 'call-outline',
      color: '#28A745',
      action: () => {
        Linking.openURL('tel:+2348001234567').catch(() => {
          Alert.alert('Error', 'Could not open phone app');
        });
      },
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => {
        Linking.openURL('https://wa.me/2348001234567').catch(() => {
          Alert.alert('Error', 'Could not open WhatsApp');
        });
      },
    },
    {
      id: 'website',
      title: 'Visit Website',
      description: 'www.surebank.com',
      icon: 'globe-outline',
      color: '#6366f1',
      action: () => {
        Linking.openURL('https://www.surebank.com').catch(() => {
          Alert.alert('Error', 'Could not open browser');
        });
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerDescription}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.contactIconContainer, { backgroundColor: `${option.color}15` }]}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqItems.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestionLeft}>
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color="#0066A1"
                      style={styles.faqIcon}
                    />
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                  </View>
                  <Ionicons
                    name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.supportHours}>
          <Ionicons name="time-outline" size={20} color="#0066A1" />
          <View style={styles.supportHoursContent}>
            <Text style={styles.supportHoursTitle}>Support Hours</Text>
            <Text style={styles.supportHoursText}>
              Monday - Friday: 8:00 AM - 8:00 PM WAT
            </Text>
            <Text style={styles.supportHoursText}>
              Saturday - Sunday: 9:00 AM - 5:00 PM WAT
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
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
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  faqIcon: {
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 48,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  resourceCard: {
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
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  supportHours: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  supportHoursContent: {
    marginLeft: 12,
    flex: 1,
  },
  supportHoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  supportHoursText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
