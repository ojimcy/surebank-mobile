/**
 * Terms of Service Screen
 * Displays SureBank's terms of service and user agreement
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SettingsScreenProps } from '@/navigation/types';

export default function TermsOfServiceScreen({ navigation }: SettingsScreenProps<'TermsOfService'>) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agreement to Terms</Text>
            <Text style={styles.paragraph}>
              These Terms of Service (&quot;Terms&quot;) govern your use of the SureBank mobile application and
              services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to
              be bound by these Terms.
            </Text>
            <Text style={styles.paragraph}>
              If you disagree with any part of these Terms, you do not have permission to access the
              Service.
            </Text>
          </View>

          {/* Eligibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility</Text>
            <Text style={styles.paragraph}>
              To use our Service, you must:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Be at least 18 years of age</Text>
              <Text style={styles.listItem}>• Be legally capable of entering into binding contracts</Text>
              <Text style={styles.listItem}>• Not be prohibited from using the Service under applicable laws</Text>
              <Text style={styles.listItem}>• Provide accurate and complete registration information</Text>
              <Text style={styles.listItem}>• Maintain the security of your account credentials</Text>
            </View>
          </View>

          {/* Account Registration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Registration</Text>
            <Text style={styles.paragraph}>
              When you create an account with us, you agree to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Provide accurate, current, and complete information
              </Text>
              <Text style={styles.listItem}>
                • Maintain and update your information to keep it accurate
              </Text>
              <Text style={styles.listItem}>
                • Keep your password secure and confidential
              </Text>
              <Text style={styles.listItem}>
                • Notify us immediately of any unauthorized access
              </Text>
              <Text style={styles.listItem}>
                • Accept responsibility for all activities under your account
              </Text>
            </View>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Provided</Text>
            <Text style={styles.paragraph}>
              SureBank provides the following financial services:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Savings accounts and packages</Text>
              <Text style={styles.listItem}>• Investment-based savings products</Text>
              <Text style={styles.listItem}>• Daily savings contributions</Text>
              <Text style={styles.listItem}>• Goal-based savings (Secure Box)</Text>
              <Text style={styles.listItem}>• Payment processing and transfers</Text>
              <Text style={styles.listItem}>• Transaction history and reporting</Text>
            </View>
          </View>

          {/* User Responsibilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Responsibilities</Text>
            <Text style={styles.paragraph}>You agree not to:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Use the Service for any illegal or unauthorized purpose
              </Text>
              <Text style={styles.listItem}>
                • Violate any laws in your jurisdiction
              </Text>
              <Text style={styles.listItem}>
                • Transmit any viruses, malware, or harmful code
              </Text>
              <Text style={styles.listItem}>
                • Attempt to gain unauthorized access to the Service
              </Text>
              <Text style={styles.listItem}>
                • Interfere with or disrupt the Service
              </Text>
              <Text style={styles.listItem}>
                • Impersonate any person or entity
              </Text>
              <Text style={styles.listItem}>
                • Engage in fraudulent activities
              </Text>
            </View>
          </View>

          {/* Fees and Payments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fees and Payments</Text>
            <Text style={styles.paragraph}>
              Use of certain features of the Service may be subject to fees. You agree to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Pay all applicable fees as described in the app
              </Text>
              <Text style={styles.listItem}>
                • Provide valid payment information
              </Text>
              <Text style={styles.listItem}>
                • Authorize us to charge your payment method
              </Text>
              <Text style={styles.listItem}>
                • Be responsible for all charges incurred
              </Text>
            </View>
            <Text style={styles.paragraph}>
              Fees are subject to change. We will notify you of any changes in advance.
            </Text>
          </View>

          {/* KYC and Verification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KYC and Identity Verification</Text>
            <Text style={styles.paragraph}>
              In compliance with regulatory requirements, we require identity verification (KYC).
              You agree to provide:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Valid government-issued identification</Text>
              <Text style={styles.listItem}>• Proof of address if required</Text>
              <Text style={styles.listItem}>• Additional documentation as requested</Text>
            </View>
            <Text style={styles.paragraph}>
              Failure to complete KYC verification may result in limited or suspended account access.
            </Text>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The Service and its original content, features, and functionality are owned by SureBank
              and are protected by international copyright, trademark, and other intellectual property
              laws. You may not:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Reproduce or copy any part of the Service</Text>
              <Text style={styles.listItem}>• Modify or create derivative works</Text>
              <Text style={styles.listItem}>• Reverse engineer the application</Text>
              <Text style={styles.listItem}>• Use our trademarks without permission</Text>
            </View>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account and access to the Service immediately, without
              prior notice, for any reason, including:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Breach of these Terms</Text>
              <Text style={styles.listItem}>• Fraudulent or illegal activity</Text>
              <Text style={styles.listItem}>• Upon your request</Text>
              <Text style={styles.listItem}>• Extended period of inactivity</Text>
            </View>
            <Text style={styles.paragraph}>
              You may close your account at any time through the app settings. Upon termination, your
              right to use the Service will cease immediately.
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              SureBank shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use or inability to use the Service. Our total
              liability shall not exceed the amount you paid to us in the past 12 months.
            </Text>
          </View>

          {/* Disclaimer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclaimer</Text>
            <Text style={styles.paragraph}>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do
              not guarantee that the Service will be uninterrupted, secure, or error-free. Investment
              products carry risk, and past performance does not guarantee future results.
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the Federal
              Republic of Nigeria, without regard to its conflict of law provisions. Any disputes shall
              be resolved in the courts of Lagos, Nigeria.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify these Terms at any time. We will notify you of any changes
              by posting the new Terms in the app and updating the &quot;Last updated&quot; date. Your continued
              use of the Service after changes constitutes acceptance of the new Terms.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about these Terms, please contact us:
            </Text>
            <View style={styles.contactBox}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>legal@surebank.com</Text>
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
