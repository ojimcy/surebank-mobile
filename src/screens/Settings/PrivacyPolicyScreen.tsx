/**
 * Privacy Policy Screen
 * Displays SureBank's comprehensive privacy policy
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
          <Text style={styles.lastUpdated}>Last Updated: October 11, 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              SureBank Stores (&quot;SureBank,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our Platform (website, mobile applications, and related services).
            </Text>
            <Text style={styles.paragraph}>
              This Privacy Policy is designed to comply with:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• The Nigeria Data Protection Act 2023 (NDPA)</Text>
              <Text style={styles.listItem}>• The Nigeria Data Protection Regulation 2019 (NDPR)</Text>
              <Text style={styles.listItem}>• Other applicable Nigerian and international data protection laws</Text>
            </View>
            <Text style={styles.paragraph}>
              By using the Platform, you consent to the collection, use, and disclosure of your personal data as described in this Privacy Policy.
            </Text>
          </View>

          {/* Data Controller Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Data Controller Information</Text>
            <View style={styles.contactBox}>
              <View style={styles.contactItem}>
                <Ionicons name="business-outline" size={16} color="#0066A1" />
                <Text style={styles.contactText}>SureBank Stores</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#0066A1" />
                <Text style={styles.contactText}>privacy@surebankstores.ng</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={16} color="#0066A1" />
                <Text style={styles.contactText}>Lagos, Nigeria</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="person-outline" size={16} color="#0066A1" />
                <Text style={styles.contactText}>Data Protection Officer: ray@surebankstores.ng</Text>
              </View>
            </View>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. What Personal Data We Collect</Text>

            <Text style={styles.subsectionTitle}>Account Registration Information</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Full name (first, middle, last)</Text>
              <Text style={styles.listItem}>• Email address and phone number</Text>
              <Text style={styles.listItem}>• Date of birth and gender</Text>
              <Text style={styles.listItem}>• Residential address</Text>
              <Text style={styles.listItem}>• Password (encrypted)</Text>
            </View>

            <Text style={styles.subsectionTitle}>Identity Verification (KYC) Information</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Bank Verification Number (BVN)</Text>
              <Text style={styles.listItem}>• Government-issued ID (National ID, Driver&apos;s License, International Passport)</Text>
              <Text style={styles.listItem}>• Proof of address documents</Text>
              <Text style={styles.listItem}>• Biometric data (if applicable)</Text>
              <Text style={styles.listItem}>• Photograph</Text>
            </View>

            <Text style={styles.subsectionTitle}>Financial Information</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Bank account details</Text>
              <Text style={styles.listItem}>• Payment card information (stored securely by payment processor)</Text>
              <Text style={styles.listItem}>• Transaction history</Text>
              <Text style={styles.listItem}>• Wallet balance and transaction records</Text>
            </View>

            <Text style={styles.subsectionTitle}>Device and Technical Information</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Device type, model, and operating system</Text>
              <Text style={styles.listItem}>• IP address and geolocation data</Text>
              <Text style={styles.listItem}>• Browser type and version</Text>
              <Text style={styles.listItem}>• Mobile network information</Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. How We Use Your Personal Data</Text>

            <Text style={styles.subsectionTitle}>Legal Bases for Processing</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Consent: You have given explicit consent for specific processing activities</Text>
              <Text style={styles.listItem}>• Contract Performance: Processing is necessary to fulfill our contractual obligations to you</Text>
              <Text style={styles.listItem}>• Legal Obligation: Processing is required to comply with Nigerian laws and regulations</Text>
              <Text style={styles.listItem}>• Legitimate Interests: Processing is necessary for our legitimate business interests (fraud prevention, Platform improvement)</Text>
            </View>

            <Text style={styles.subsectionTitle}>Purposes of Processing</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Creating and maintaining your account</Text>
              <Text style={styles.listItem}>• Processing savings contributions and payments</Text>
              <Text style={styles.listItem}>• Verifying your identity (KYC compliance)</Text>
              <Text style={styles.listItem}>• Preventing fraud and ensuring security</Text>
              <Text style={styles.listItem}>• Analyzing usage patterns to improve user experience</Text>
              <Text style={styles.listItem}>• Sending promotional offers and product recommendations</Text>
              <Text style={styles.listItem}>• Complying with legal obligations and regulatory requirements</Text>
            </View>
          </View>

          {/* Data Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal data to third parties. We share your data only with:
            </Text>

            <Text style={styles.subsectionTitle}>Service Providers</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Payment Processors (Paystack): Payment processing, card tokenization</Text>
              <Text style={styles.listItem}>• Cloud Infrastructure Providers (AWS): Data hosting and storage</Text>
              <Text style={styles.listItem}>• Identity Verification Services: BVN verification</Text>
              <Text style={styles.listItem}>• Email and SMS Service Providers: Communications</Text>
              <Text style={styles.listItem}>• Analytics Providers (Firebase): App usage analytics</Text>
              <Text style={styles.listItem}>• Delivery Partners: Logistics and courier companies</Text>
            </View>

            <Text style={styles.subsectionTitle}>Legal and Regulatory Authorities</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Law enforcement agencies pursuant to valid legal requests</Text>
              <Text style={styles.listItem}>• Regulatory authorities (Central Bank of Nigeria, NDPC)</Text>
              <Text style={styles.listItem}>• Courts and tribunals in response to subpoenas or court orders</Text>
            </View>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your personal data:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• End-to-end encryption for data transmission (TLS/SSL)</Text>
              <Text style={styles.listItem}>• Encryption at rest for stored data (AES-256)</Text>
              <Text style={styles.listItem}>• Secure password hashing (bcrypt with salt)</Text>
              <Text style={styles.listItem}>• Multi-factor authentication (optional but recommended)</Text>
              <Text style={styles.listItem}>• Regular security audits and penetration testing</Text>
              <Text style={styles.listItem}>• Access controls and role-based permissions</Text>
            </View>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Your Data Protection Rights</Text>
            <Text style={styles.paragraph}>
              Under the Nigeria Data Protection Act 2023, you have the following rights:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Right to Access: Request confirmation and a copy of your personal data</Text>
              <Text style={styles.listItem}>• Right to Rectification: Request correction of inaccurate or incomplete data</Text>
              <Text style={styles.listItem}>• Right to Erasure: Request deletion of your data under certain circumstances</Text>
              <Text style={styles.listItem}>• Right to Restriction: Request limitation of processing</Text>
              <Text style={styles.listItem}>• Right to Data Portability: Receive your data in a structured, machine-readable format</Text>
              <Text style={styles.listItem}>• Right to Object: Object to processing based on legitimate interests</Text>
              <Text style={styles.listItem}>• Right to Withdraw Consent: Withdraw consent at any time</Text>
              <Text style={styles.listItem}>• Right to Lodge a Complaint: File a complaint with the Nigeria Data Protection Commission</Text>
            </View>

            <Text style={styles.subsectionTitle}>How to Exercise Your Rights</Text>
            <Text style={styles.paragraph}>
              To exercise any of these rights, email us at privacy@surebankstores.ng with your full name, email address, and account details. We will respond within 30 days.
            </Text>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Data Retention</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Active Account data: Retained while account is active and for 7 years after closure</Text>
              <Text style={styles.listItem}>• Transaction records: Retained for 7 years (financial record-keeping requirements)</Text>
              <Text style={styles.listItem}>• Communication records: Retained for 3 years</Text>
              <Text style={styles.listItem}>• Inactive accounts (12+ months): May be deactivated with 90 days notice</Text>
            </View>
          </View>

          {/* Children's Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              The Platform is not intended for children under 18 years of age. We do not knowingly collect personal data from children. If we discover that we have inadvertently collected data from a child, we will delete it immediately.
            </Text>
            <Text style={styles.paragraph}>
              Parents/guardians who believe their child has provided personal data should contact us at privacy@surebankstores.ng
            </Text>
          </View>

          {/* International Data Transfers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
            <Text style={styles.paragraph}>
              Your personal data is primarily stored on servers located in Nigeria and other jurisdictions via AWS cloud infrastructure (Europe, US).
            </Text>
            <Text style={styles.paragraph}>
              When transferring data internationally, we ensure adequate protection through standard contractual clauses, service provider commitments to comply with NDPA requirements, and encryption during transfer.
            </Text>
          </View>

          {/* Cookies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Cookies and Tracking Technologies</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar tracking technologies to improve your experience:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Essential Cookies: Required for platform functionality</Text>
              <Text style={styles.listItem}>• Analytics Cookies: Track usage patterns and performance</Text>
              <Text style={styles.listItem}>• Functional Cookies: Remember your preferences and settings</Text>
              <Text style={styles.listItem}>• Advertising Cookies: Deliver targeted advertisements</Text>
            </View>
            <Text style={styles.paragraph}>
              You can control cookies through your browser settings or platform settings.
            </Text>
          </View>

          {/* Changes to Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to This Privacy Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically to reflect changes in our data practices, legal or regulatory requirements, or platform updates.
            </Text>
            <Text style={styles.paragraph}>
              We will notify you of material changes via email, in-app notification, or prominent notice on the Platform. Changes become effective 30 days after notification (or immediately for legal requirements).
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.paragraph}>
              For privacy-related questions, concerns, or requests:
            </Text>
            <View style={styles.contactBox}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>privacy@surebankstores.ng</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>+234 803 131 3024</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>Lagos, Nigeria</Text>
              </View>
            </View>
          </View>

          {/* Compliance Statement */}
          <View style={styles.complianceBox}>
            <Text style={styles.complianceTitle}>Compliance Statement</Text>
            <Text style={styles.complianceText}>
              This Privacy Policy has been designed to comply with the Nigeria Data Protection Act 2023 (NDPA), Nigeria Data Protection Regulation 2019 (NDPR), and Guidelines issued by the Nigeria Data Protection Commission.
            </Text>
            <Text style={styles.complianceText}>
              SureBank Stores is committed to upholding the highest standards of data protection and respecting the privacy rights of all users.
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
    marginBottom: 10,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
  complianceBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 16,
    marginBottom: 24,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  complianceText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 8,
  },
});
