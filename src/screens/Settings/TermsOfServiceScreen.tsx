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
          <Text style={styles.lastUpdated}>Last Updated: October 11, 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction and Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              Welcome to SureBank Stores (&quot;SureBank,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the SureBank Stores platform, mobile applications, website, and related services (collectively, the &quot;Platform&quot;).
            </Text>
            <Text style={styles.paragraph}>
              By registering for, accessing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Jurisdiction:</Text> These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            </Text>
          </View>

          {/* Definitions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Definitions</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Platform&quot;:</Text> The SureBank Stores website, mobile applications, and all related services.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;User,&quot; &quot;you,&quot; &quot;your&quot;:</Text> Any individual or entity accessing or using the Platform.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Save-to-Own Program&quot;:</Text> A structured savings plan enabling Users to accumulate funds toward the purchase of products.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Daily Flex Savings&quot;:</Text> A voluntary 31-day savings commitment program designed to help Users build consistent saving habits.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Account&quot;:</Text> Your registered user profile on the Platform.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Wallet&quot;:</Text> Your digital balance maintained on the Platform for transactions.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Products&quot;:</Text> Electronics, furniture, automobiles, fashion items, and other goods available for purchase through the Platform.</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>&quot;Package&quot;:</Text> A specific savings plan with defined contribution amounts and schedules.</Text>
            </View>
          </View>

          {/* Eligibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Eligibility and Account Registration</Text>

            <Text style={styles.subsectionTitle}>3.1 Eligibility Requirements</Text>
            <Text style={styles.paragraph}>
              To use the Platform, you must:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Be at least 18 years of age or the age of legal majority in your jurisdiction</Text>
              <Text style={styles.listItem}>• Be a resident of Nigeria</Text>
              <Text style={styles.listItem}>• Have the legal capacity to enter into binding contracts</Text>
              <Text style={styles.listItem}>• Not be prohibited from using the Platform under Nigerian law</Text>
            </View>

            <Text style={styles.subsectionTitle}>3.2 Account Registration</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• You must provide accurate, complete, and current information during registration</Text>
              <Text style={styles.listItem}>• You are responsible for maintaining the confidentiality of your account credentials</Text>
              <Text style={styles.listItem}>• You must notify us immediately of any unauthorized access to your Account</Text>
              <Text style={styles.listItem}>• You may not transfer or share your Account with any other person</Text>
              <Text style={styles.listItem}>• You are solely responsible for all activities conducted through your Account</Text>
            </View>

            <Text style={styles.subsectionTitle}>3.3 Account Verification (KYC)</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• We may require identity verification through Bank Verification Number (BVN), government-issued ID, or other acceptable means</Text>
              <Text style={styles.listItem}>• Failure to complete verification may result in limited Platform functionality or Account suspension</Text>
              <Text style={styles.listItem}>• We reserve the right to request additional documentation at any time</Text>
            </View>
          </View>

          {/* Save-to-Own Program */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Save-to-Own Program</Text>

            <Text style={styles.subsectionTitle}>4.1 Program Overview</Text>
            <Text style={styles.paragraph}>
              The Save-to-Own Program allows you to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Select Products from our catalogue</Text>
              <Text style={styles.listItem}>• Choose a savings Package with predetermined contribution amounts and schedules</Text>
              <Text style={styles.listItem}>• Make regular contributions toward Product purchase</Text>
              <Text style={styles.listItem}>• Receive delivery of Products upon completion of payment obligations</Text>
            </View>

            <Text style={styles.subsectionTitle}>4.2 How It Works</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>1. <Text style={styles.boldText}>Product Selection:</Text> Browse and select Products available for the Save-to-Own Program</Text>
              <Text style={styles.listItem}>2. <Text style={styles.boldText}>Package Selection:</Text> Choose from available savings Packages with varying contribution frequencies (weekly, bi-weekly, monthly)</Text>
              <Text style={styles.listItem}>3. <Text style={styles.boldText}>Savings Commitment:</Text> Commit to regular contributions according to your selected Package</Text>
              <Text style={styles.listItem}>4. <Text style={styles.boldText}>Payment:</Text> Make contributions via bank transfer, card payment, or virtual account deposit</Text>
              <Text style={styles.listItem}>5. <Text style={styles.boldText}>Product Delivery:</Text> Upon completion of required contributions, Products are delivered to your specified address</Text>
            </View>

            <Text style={styles.subsectionTitle}>4.3 Pricing and Fees</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Product prices may include processing fees, administrative charges, and delivery costs</Text>
              <Text style={styles.listItem}>• All fees are disclosed transparently before you commit to a Package</Text>
              <Text style={styles.listItem}>• Prices are subject to change, but your committed Package price remains fixed once initiated</Text>
              <Text style={styles.listItem}>• We reserve the right to adjust pricing for new Packages due to market conditions</Text>
            </View>

            <Text style={styles.subsectionTitle}>4.4 Contribution Management</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Contributions must be made according to your selected schedule</Text>
              <Text style={styles.listItem}>• Missed contributions may result in late fees or penalties (as disclosed in your Package terms), extension of your Package completion date, or potential Package cancellation after prolonged non-payment</Text>
              <Text style={styles.listItem}>• You may make early or additional contributions to accelerate Package completion</Text>
            </View>

            <Text style={styles.subsectionTitle}>4.5 Package Cancellation and Refunds</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>User-Initiated Cancellation:</Text> You may request Package cancellation at any time. An administrative fee may apply (maximum 5% of accumulated balance or ₦5,000, whichever is lower). Refunds are processed to your original payment method or Wallet within 7-14 business days. Products cannot be delivered upon cancellation.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Platform-Initiated Cancellation:</Text> We may cancel your Package if you violate these Terms, fail to make contributions for 60 consecutive days (unless otherwise specified), or Products become unavailable due to circumstances beyond our control. Refunds will be issued in full with no administrative fees.
            </Text>
          </View>

          {/* Daily Flex Savings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Daily Flex Savings Program</Text>

            <Text style={styles.subsectionTitle}>5.1 Program Nature and Purpose</Text>
            <Text style={styles.paragraph}>
              Daily Flex Savings is a <Text style={styles.boldText}>voluntary savings commitment program</Text> designed to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Encourage consistent daily saving habits</Text>
              <Text style={styles.listItem}>• Provide a structured 31-day savings cycle</Text>
              <Text style={styles.listItem}>• Help Users accumulate funds for personal financial goals</Text>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>IMPORTANT DISCLAIMERS</Text>
              <View style={styles.list}>
                <Text style={styles.disclaimerText}>• This is NOT a deposit account, fixed deposit, or investment product</Text>
                <Text style={styles.disclaimerText}>• This is NOT regulated by the Central Bank of Nigeria as a deposit-taking service</Text>
                <Text style={styles.disclaimerText}>• Funds are NOT insured by the Nigeria Deposit Insurance Corporation (NDIC)</Text>
                <Text style={styles.disclaimerText}>• No interest or returns are earned on savings</Text>
                <Text style={styles.disclaimerText}>• This is a technology-enabled savings discipline tool</Text>
              </View>
            </View>

            <Text style={styles.subsectionTitle}>5.2 How It Works</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>1. <Text style={styles.boldText}>Enrollment:</Text> Select your daily contribution amount</Text>
              <Text style={styles.listItem}>2. <Text style={styles.boldText}>31-Day Cycle:</Text> Commit to daily contributions for 31 consecutive days</Text>
              <Text style={styles.listItem}>3. <Text style={styles.boldText}>Operational Fee:</Text> One (1) daily contribution amount is retained as a platform operational and account maintenance fee</Text>
              <Text style={styles.listItem}>4. <Text style={styles.boldText}>Withdrawal:</Text> After cycle completion, withdraw 30 contributions from your Wallet</Text>
              <Text style={styles.listItem}>5. <Text style={styles.boldText}>Early Termination:</Text> Request early termination at any time and access accumulated funds (less operational fee)</Text>
            </View>

            <Text style={styles.subsectionTitle}>5.3 Contributions and Fees</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Daily contributions are debited automatically from your funding source (card, bank account, or Wallet)</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>Operational Fee:</Text> 1 contribution (approximately 3.2% of total cycle contributions) covers platform development and maintenance, payment processing costs, customer support services, and secure data storage and account management</Text>
              <Text style={styles.listItem}>• Failed contributions may result in cycle suspension until resolved</Text>
            </View>

            <Text style={styles.subsectionTitle}>5.4 Withdrawals and Access</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Funds are available for withdrawal after 31-day cycle completion</Text>
              <Text style={styles.listItem}>• Withdrawals processed within 1-3 business days to your registered bank account</Text>
              <Text style={styles.listItem}>• Early termination: Access funds at any time, subject to operational fee deduction</Text>
              <Text style={styles.listItem}>• No minimum withdrawal amount (beyond operational fee)</Text>
            </View>

            <Text style={styles.subsectionTitle}>5.5 Program Limitations</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Maximum daily contribution: ₦50,000</Text>
              <Text style={styles.listItem}>• You may run multiple concurrent cycles (maximum 5 simultaneous cycles)</Text>
              <Text style={styles.listItem}>• We reserve the right to suspend or modify the program with 30 days notice</Text>
            </View>

            <Text style={styles.subsectionTitle}>5.6 Risk Acknowledgment</Text>
            <Text style={styles.paragraph}>
              By participating in Daily Flex Savings, you acknowledge and accept that:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• SureBank acts solely as a technology service provider facilitating voluntary savings</Text>
              <Text style={styles.listItem}>• Your funds are held for safekeeping and returned as contributed (less operational fees)</Text>
              <Text style={styles.listItem}>• We do not guarantee returns, interest, or investment growth</Text>
              <Text style={styles.listItem}>• Platform technical issues, payment processor failures, or force majeure events may delay access to funds</Text>
              <Text style={styles.listItem}>• You are responsible for your own financial planning and decision-making</Text>
            </View>
          </View>

          {/* Payments and Financial Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Payments and Financial Transactions</Text>

            <Text style={styles.subsectionTitle}>6.1 Payment Methods</Text>
            <Text style={styles.paragraph}>
              We accept payments through:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Debit/credit cards (via Paystack)</Text>
              <Text style={styles.listItem}>• Bank transfers to designated virtual accounts</Text>
              <Text style={styles.listItem}>• Wallet balance</Text>
              <Text style={styles.listItem}>• Other payment methods as made available</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.2 Payment Processing</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Payments are processed through third-party payment processors (primarily Paystack)</Text>
              <Text style={styles.listItem}>• You authorize us to charge your selected payment method for contributions and purchases</Text>
              <Text style={styles.listItem}>• Payment processing times vary by method (instant for cards, up to 24 hours for bank transfers)</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.3 Failed Payments</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Failed payments may incur retry fees imposed by payment processors</Text>
              <Text style={styles.listItem}>• Repeated payment failures may result in Account suspension or Package cancellation</Text>
              <Text style={styles.listItem}>• You are responsible for maintaining sufficient funds in your payment method</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.4 Wallet Management</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Your Wallet balance can be used for Product purchases, Package contributions, and Daily Flex Savings contributions</Text>
              <Text style={styles.listItem}>• Wallet funds can be withdrawn to your registered bank account</Text>
              <Text style={styles.listItem}>• Withdrawal processing: 1-3 business days</Text>
              <Text style={styles.listItem}>• Minimum withdrawal amount: ₦500</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.5 Refunds and Disputes</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Refund requests are evaluated on a case-by-case basis</Text>
              <Text style={styles.listItem}>• Refunds for cancelled Packages: 7-14 business days</Text>
              <Text style={styles.listItem}>• Payment disputes should be reported within 7 days of transaction</Text>
              <Text style={styles.listItem}>• We will investigate disputed transactions and respond within 14 business days</Text>
            </View>
          </View>

          {/* Products and Delivery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Products and Delivery</Text>

            <Text style={styles.subsectionTitle}>7.1 Product Information</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• We strive to provide accurate Product descriptions, images, and specifications</Text>
              <Text style={styles.listItem}>• Actual Products may vary slightly from images due to screen display differences</Text>
              <Text style={styles.listItem}>• Product availability is subject to change without notice</Text>
            </View>

            <Text style={styles.subsectionTitle}>7.2 Product Ownership</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Products remain the property of SureBank until full payment is completed</Text>
              <Text style={styles.listItem}>• Risk of loss transfers to you upon delivery confirmation</Text>
              <Text style={styles.listItem}>• You may not resell, transfer, or encumber Products before full payment</Text>
            </View>

            <Text style={styles.subsectionTitle}>7.3 Delivery</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Delivery timelines are estimates and not guarantees</Text>
              <Text style={styles.listItem}>• Delivery is to addresses within Nigeria only</Text>
              <Text style={styles.listItem}>• You must provide accurate delivery information</Text>
              <Text style={styles.listItem}>• Delivery fees are calculated based on location and Product specifications</Text>
              <Text style={styles.listItem}>• You are responsible for receiving delivery or designating an authorized recipient</Text>
            </View>

            <Text style={styles.subsectionTitle}>7.4 Inspection and Acceptance</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• You must inspect Products upon delivery</Text>
              <Text style={styles.listItem}>• Report defects, damage, or discrepancies within 48 hours of delivery</Text>
              <Text style={styles.listItem}>• Failure to report issues within 48 hours constitutes acceptance of Products</Text>
            </View>

            <Text style={styles.subsectionTitle}>7.5 Returns and Warranty</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Return policy: 7 days from delivery for defective or incorrect Products</Text>
              <Text style={styles.listItem}>• Products must be in original condition with all packaging and accessories</Text>
              <Text style={styles.listItem}>• Manufacturer warranties apply as specified for each Product</Text>
              <Text style={styles.listItem}>• We are not responsible for manufacturer defects beyond facilitating warranty claims</Text>
            </View>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Intellectual Property</Text>

            <Text style={styles.subsectionTitle}>8.1 Platform Content</Text>
            <Text style={styles.paragraph}>
              All content on the Platform, including but not limited to text, graphics, logos, images, videos, software, code, databases, trademarks, service marks, and trade names are the exclusive property of SureBank or our licensors and protected by Nigerian and international intellectual property laws.
            </Text>

            <Text style={styles.subsectionTitle}>8.2 Limited License</Text>
            <Text style={styles.paragraph}>
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes in accordance with these Terms.
            </Text>

            <Text style={styles.subsectionTitle}>8.3 Prohibited Uses</Text>
            <Text style={styles.paragraph}>
              You may not:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Copy, modify, distribute, or create derivative works of Platform content</Text>
              <Text style={styles.listItem}>• Reverse engineer, decompile, or disassemble Platform software</Text>
              <Text style={styles.listItem}>• Use automated systems (bots, scrapers) to access the Platform</Text>
              <Text style={styles.listItem}>• Remove or alter copyright, trademark, or proprietary notices</Text>
            </View>
          </View>

          {/* User Conduct */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. User Conduct and Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              You agree not to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Violate any applicable laws or regulations</Text>
              <Text style={styles.listItem}>• Impersonate any person or entity</Text>
              <Text style={styles.listItem}>• Transmit viruses, malware, or harmful code</Text>
              <Text style={styles.listItem}>• Attempt unauthorized access to Platform systems or other user Accounts</Text>
              <Text style={styles.listItem}>• Interfere with Platform operations or security features</Text>
              <Text style={styles.listItem}>• Use the Platform for fraudulent, abusive, or illegal purposes</Text>
              <Text style={styles.listItem}>• Harass, threaten, or harm other Users or Platform personnel</Text>
              <Text style={styles.listItem}>• Submit false, misleading, or deceptive information</Text>
              <Text style={styles.listItem}>• Engage in money laundering or terrorist financing activities</Text>
            </View>
          </View>

          {/* Platform Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Platform Availability and Modifications</Text>

            <Text style={styles.subsectionTitle}>10.1 Service Availability</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• We strive to maintain Platform availability 24/7</Text>
              <Text style={styles.listItem}>• We do not guarantee uninterrupted or error-free service</Text>
              <Text style={styles.listItem}>• Maintenance, updates, and technical issues may cause temporary unavailability</Text>
              <Text style={styles.listItem}>• We are not liable for losses resulting from Platform downtime</Text>
            </View>

            <Text style={styles.subsectionTitle}>10.2 Modifications</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• We reserve the right to modify, suspend, or discontinue any Platform feature at any time</Text>
              <Text style={styles.listItem}>• We will provide reasonable notice of material changes when feasible</Text>
              <Text style={styles.listItem}>• Continued use after modifications constitutes acceptance of changes</Text>
            </View>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>

            <Text style={styles.subsectionTitle}>11.1 Disclaimer of Warranties</Text>
            <Text style={styles.paragraph}>
              THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </Text>

            <Text style={styles.subsectionTitle}>11.2 Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• SureBank&apos;s total liability for any claims arising from or related to the Platform shall not exceed the amount you paid to us in the 12 months preceding the claim</Text>
              <Text style={styles.listItem}>• We are not liable for indirect, incidental, consequential, special, or punitive damages</Text>
              <Text style={styles.listItem}>• We are not liable for losses caused by User error or misuse of the Platform, third-party payment processor failures, Internet connectivity issues, unauthorized Account access resulting from User negligence, or force majeure events (natural disasters, war, government actions, etc.)</Text>
            </View>

            <Text style={styles.subsectionTitle}>11.3 Third-Party Services</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• We are not responsible for third-party services (payment processors, delivery partners, manufacturers)</Text>
              <Text style={styles.listItem}>• Your use of third-party services is subject to their terms and conditions</Text>
              <Text style={styles.listItem}>• We do not endorse or guarantee third-party services</Text>
            </View>
          </View>

          {/* Indemnification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Indemnification</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify, defend, and hold harmless SureBank, its affiliates, officers, directors, employees, agents, and partners from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys&apos; fees) arising from:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Your use or misuse of the Platform</Text>
              <Text style={styles.listItem}>• Your violation of these Terms</Text>
              <Text style={styles.listItem}>• Your violation of any third-party rights</Text>
              <Text style={styles.listItem}>• Your violation of applicable laws or regulations</Text>
            </View>
          </View>

          {/* Dispute Resolution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Dispute Resolution and Governing Law</Text>

            <Text style={styles.subsectionTitle}>13.1 Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms are governed by the laws of the Federal Republic of Nigeria.
            </Text>

            <Text style={styles.subsectionTitle}>13.2 Dispute Resolution Process</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>1. <Text style={styles.boldText}>Informal Resolution:</Text> Contact our customer support to attempt informal resolution</Text>
              <Text style={styles.listItem}>2. <Text style={styles.boldText}>Mediation:</Text> If informal resolution fails, parties agree to mediation before pursuing litigation</Text>
              <Text style={styles.listItem}>3. <Text style={styles.boldText}>Arbitration:</Text> Disputes not resolved through mediation shall be submitted to arbitration under the Arbitration and Mediation Act of Nigeria</Text>
              <Text style={styles.listItem}>4. <Text style={styles.boldText}>Jurisdiction:</Text> If arbitration is not pursued, disputes shall be resolved in the courts of Lagos State, Nigeria</Text>
            </View>

            <Text style={styles.subsectionTitle}>13.3 Class Action Waiver</Text>
            <Text style={styles.paragraph}>
              You agree to resolve disputes on an individual basis and waive the right to participate in class actions or representative proceedings.
            </Text>
          </View>

          {/* Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Privacy and Data Protection</Text>
            <Text style={styles.paragraph}>
              Your privacy is important to us. Our Privacy Policy (incorporated by reference) explains what personal data we collect, how we use, store, and protect your data, your rights under the Nigeria Data Protection Act 2023 (NDPA), and how to exercise your data rights.
            </Text>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. Termination</Text>

            <Text style={styles.subsectionTitle}>15.1 Termination by User</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• You may terminate your Account at any time by contacting customer support</Text>
              <Text style={styles.listItem}>• You remain responsible for obligations incurred before termination</Text>
              <Text style={styles.listItem}>• Wallet balances will be refunded upon request (processing time: 7-14 business days)</Text>
            </View>

            <Text style={styles.subsectionTitle}>15.2 Termination by SureBank</Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate your Account immediately if:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• You violate these Terms</Text>
              <Text style={styles.listItem}>• You engage in fraudulent or illegal activities</Text>
              <Text style={styles.listItem}>• Your Account is inactive for more than 12 consecutive months</Text>
              <Text style={styles.listItem}>• We are required to do so by law or regulatory authority</Text>
            </View>

            <Text style={styles.subsectionTitle}>15.3 Effect of Termination</Text>
            <Text style={styles.paragraph}>
              Upon termination, your right to access and use the Platform ceases immediately. Outstanding obligations (payments, deliveries) remain enforceable. Provisions of these Terms that by nature should survive (indemnification, limitation of liability, dispute resolution) remain in effect.
            </Text>
          </View>

          {/* General Provisions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>16. General Provisions</Text>

            <Text style={styles.subsectionTitle}>16.1 Entire Agreement</Text>
            <Text style={styles.paragraph}>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and SureBank regarding the Platform.
            </Text>

            <Text style={styles.subsectionTitle}>16.2 Severability</Text>
            <Text style={styles.paragraph}>
              If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in full force and effect.
            </Text>

            <Text style={styles.subsectionTitle}>16.3 Waiver</Text>
            <Text style={styles.paragraph}>
              Our failure to enforce any provision does not constitute a waiver of that provision or any other provision.
            </Text>

            <Text style={styles.subsectionTitle}>16.4 Assignment</Text>
            <Text style={styles.paragraph}>
              You may not assign or transfer these Terms or your Account without our prior written consent. We may assign these Terms at any time without notice.
            </Text>

            <Text style={styles.subsectionTitle}>16.5 Force Majeure</Text>
            <Text style={styles.paragraph}>
              We are not liable for failure to perform obligations due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, pandemics, government actions, labor disputes, or infrastructure failures.
            </Text>

            <Text style={styles.subsectionTitle}>16.6 Notices</Text>
            <Text style={styles.paragraph}>
              Notices to you may be sent via email to your registered email address, in-app notifications, or SMS to your registered phone number.
            </Text>
            <Text style={styles.paragraph}>
              Notices to us should be sent to: legal@surebankstores.ng
            </Text>

            <Text style={styles.subsectionTitle}>16.7 Language</Text>
            <Text style={styles.paragraph}>
              In the event of any conflict between the English version of these Terms and any translation, the English version shall prevail.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>17. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions, concerns, or support regarding these Terms or the Platform:
            </Text>
            <View style={styles.contactBox}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#0066A1" />
                <Text style={styles.contactText}>support@surebankstores.ng</Text>
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

          {/* Updates to Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>18. Updates to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to update these Terms at any time. We will notify Users of material changes via email notification, in-app notification, or prominent notice on the Platform.
            </Text>
            <Text style={styles.paragraph}>
              Your continued use of the Platform after changes take effect constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.
            </Text>
          </View>

          {/* Acknowledgment */}
          <View style={styles.acknowledgmentBox}>
            <Text style={styles.acknowledgmentText}>
              BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
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
  boldText: {
    fontWeight: '600',
    color: '#111827',
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
  disclaimerBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
    marginTop: 12,
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
    marginBottom: 4,
  },
  acknowledgmentBox: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#86efac',
    marginTop: 16,
    marginBottom: 24,
  },
  acknowledgmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    lineHeight: 22,
    textAlign: 'center',
  },
});
