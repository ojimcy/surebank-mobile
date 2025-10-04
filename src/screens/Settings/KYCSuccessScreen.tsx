/**
 * KYC Success Screen
 *
 * Confirmation screen shown after successful KYC submission
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SettingsScreenProps } from '@/navigation/types';
import { useQueryClient } from '@tanstack/react-query';

export default function KYCSuccessScreen({ navigation }: SettingsScreenProps<'KYCSuccess'>) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate KYC status query to refresh the status
    queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
  }, [queryClient]);

  const handleGoToDashboard = () => {
    navigation.navigate('Settings');
  };

  const handleContinue = () => {
    // Navigate back to where user came from or dashboard
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Verification Submitted!</Text>
          <Text style={styles.subtitle}>
            Thank you for completing your KYC verification
          </Text>
        </View>

        {/* Status Information */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="time-outline" size={24} color="#FFC107" />
            <Text style={styles.statusTitle}>What&apos;s Next?</Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusText}>
              Your verification is now under review. This process typically takes:
            </Text>

            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>1-2 Business Days</Text>
                  <Text style={styles.timelineDescription}>
                    For standard verification review
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Email Notification</Text>
                  <Text style={styles.timelineDescription}>
                    You&apos;ll receive an email once verified
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Full Access</Text>
                  <Text style={styles.timelineDescription}>
                    Unlock all SureBank features after approval
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Once Verified, You Can:</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="wallet-outline" size={20} color="#0066A1" />
              <Text style={styles.featureText}>Create unlimited savings accounts</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="trending-up-outline" size={20} color="#0066A1" />
              <Text style={styles.featureText}>Access investment opportunities</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="cash-outline" size={20} color="#0066A1" />
              <Text style={styles.featureText}>Enjoy higher transaction limits</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#0066A1" />
              <Text style={styles.featureText}>Enhanced security features</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="gift-outline" size={20} color="#0066A1" />
              <Text style={styles.featureText}>Exclusive rewards and bonuses</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#0066A1" />
            <Text style={styles.tipsTitle}>Helpful Tips</Text>
          </View>

          <Text style={styles.tipsText}>
            • Keep your app updated to receive real-time notifications
          </Text>
          <Text style={styles.tipsText}>
            • Check your email for verification status updates
          </Text>
          <Text style={styles.tipsText}>
            • Contact support if you don&apos;t hear back within 3 business days
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoToDashboard}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#28A745',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#28A745',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  statusContent: {
    gap: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  timelineContainer: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066A1',
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  featuresCard: {
    backgroundColor: '#E6F2F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066A1',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 12,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0066A1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});