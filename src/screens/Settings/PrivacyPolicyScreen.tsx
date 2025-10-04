/**
 * Privacy Policy Screen
 * Displays SureBank's privacy policy
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SettingsScreenProps } from '@/navigation/types';

export default function PrivacyPolicyScreen({}: SettingsScreenProps<'PrivacyPolicy'>) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.paragraph}>
              SureBank (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our mobile
              application and services.
            </Text>
            <Text style={styles.paragraph}>
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              application.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>

            <Text style={styles.subsectionTitle}>Personal Information</Text>
            <Text style={styles.paragraph}>
              We collect personal information that you voluntarily provide to us
              when registering at the application, including:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Full name and contact information
              </Text>
              <Text style={styles.listItem}>
                • Email address and phone number
              </Text>
              <Text style={styles.listItem}>
                • Government-issued identification documents
              </Text>
              <Text style={styles.listItem}>
                • Financial information and payment card details
              </Text>
              <Text style={styles.listItem}>• Bank account information</Text>
            </View>

            <Text style={styles.subsectionTitle}>
              Automatically Collected Information
            </Text>
            <Text style={styles.paragraph}>
              When you access our app, we automatically collect certain
              information, including:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Device information (model, OS version)
              </Text>
              <Text style={styles.listItem}>
                • IP address and location data
              </Text>
              <Text style={styles.listItem}>• Usage data and analytics</Text>
              <Text style={styles.listItem}>
                • Crash reports and performance data
              </Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use your information to:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Create and manage your account
              </Text>
              <Text style={styles.listItem}>
                • Process your transactions and payments
              </Text>
              <Text style={styles.listItem}>
                • Verify your identity (KYC compliance)
              </Text>
              <Text style={styles.listItem}>
                • Send you notifications and updates
              </Text>
              <Text style={styles.listItem}>
                • Improve our services and user experience
              </Text>
              <Text style={styles.listItem}>
                • Prevent fraud and ensure security
              </Text>
              <Text style={styles.listItem}>
                • Comply with legal and regulatory requirements
              </Text>
            </View>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational security
              measures to protect your personal information, including:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • 256-bit SSL/TLS encryption for data transmission
              </Text>
              <Text style={styles.listItem}>
                • Encrypted storage of sensitive information
              </Text>
              <Text style={styles.listItem}>
                • Regular security audits and testing
              </Text>
              <Text style={styles.listItem}>
                • Access controls and authentication
              </Text>
              <Text style={styles.listItem}>
                • Secure payment processing (PCI DSS compliant)
              </Text>
            </View>
          </View>

          {/* Data Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information. We may share your
              information with:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Service providers (payment processors, identity verification
                services)
              </Text>
              <Text style={styles.listItem}>
                • Financial institutions for transaction processing
              </Text>
              <Text style={styles.listItem}>
                • Regulatory authorities when required by law
              </Text>
              <Text style={styles.listItem}>
                • Law enforcement agencies when legally obligated
              </Text>
            </View>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
            <Text style={styles.paragraph}>You have the right to:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Access your personal information
              </Text>
              <Text style={styles.listItem}>
                • Correct inaccurate or incomplete data
              </Text>
              <Text style={styles.listItem}>
                • Request deletion of your data
              </Text>
              <Text style={styles.listItem}>
                • Object to processing of your data
              </Text>
              <Text style={styles.listItem}>
                • Export your data in a portable format
              </Text>
              <Text style={styles.listItem}>
                • Withdraw consent at any time
              </Text>
            </View>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this policy, unless a longer
              retention period is required by law. After account closure, we may
              retain certain information for legal and regulatory compliance.
            </Text>
          </View>

          {/* Children's Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you believe we have collected information from a child, please
              contact us immediately.
            </Text>
          </View>

          {/* Changes to Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy in the
              app and updating the &quot;Last updated&quot; date. You are advised to
              review this policy periodically for any changes.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions or concerns about this Privacy Policy,
              please contact us:
            </Text>
            <View style={styles.contactBox}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>privacy@surebank.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>+234 800 123 4567</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>
                  123 Financial District, Lagos, Nigeria
                </Text>
              </View>
            </View>
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
  },
  lastUpdated: {
    fontSize: 13,
    color: '#6b7280',
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  list: {
    marginLeft: 8,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 4,
  },
  contactBox: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
});
