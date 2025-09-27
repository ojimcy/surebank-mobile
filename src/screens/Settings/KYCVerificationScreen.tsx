/**
 * KYC Verification Main Screen
 *
 * Entry point for KYC verification process
 * Shows current KYC status and options to verify
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import type { SettingsScreenProps } from '@/navigation/types';
import { useAuth } from '@/contexts/AuthContext';

export default function KYCVerificationScreen({ navigation }: SettingsScreenProps<'KYCVerification'>) {
  const { user } = useAuth();

  // Use KYC status from user object
  const kycStatus = user?.kycStatus;
  const kycType = user?.kycType;
  const bvnVerified = user?.bvnVerified;

  const handleStartVerification = (type: 'id' | 'bvn') => {
    if (type === 'id') {
      navigation.navigate('KYCIdVerification');
    } else {
      // BVN verification not yet implemented
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'BVN verification will be available soon',
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return '#28A745';
      case 'pending':
        return '#FFC107';
      case 'rejected':
      case 'failed':
        return '#DC3545';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
      case 'failed':
        return 'close-circle';
      default:
        return 'alert-circle';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Not Verified';
    }
  };

  const getVerificationTypeText = () => {
    if (kycType === 'id') return 'Government ID';
    if (bvnVerified) return 'BVN';
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${getStatusColor(kycStatus)}20` }]}>
            <Ionicons
              name={getStatusIcon(kycStatus) as any}
              size={48}
              color={getStatusColor(kycStatus)}
            />
          </View>

          <Text style={styles.statusTitle}>
            {getStatusText(kycStatus)}
          </Text>

          {(kycStatus === 'verified' || kycStatus === 'approved') && getVerificationTypeText() && (
            <Text style={styles.statusMessage}>
              Verified with {getVerificationTypeText()}
            </Text>
          )}

          {kycStatus === 'pending' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
              <Text style={styles.infoText}>
                Your verification is being reviewed. This usually takes 1-2 business days.
              </Text>
            </View>
          )}

          {(kycStatus === 'rejected' || kycStatus === 'failed') && (
            <View style={[styles.infoBox, styles.errorBox]}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC3545" />
              <Text style={[styles.infoText, styles.errorText]}>
                Your verification was unsuccessful. Please try again with valid documents.
              </Text>
            </View>
          )}
        </View>

        {/* Verification Options - Only show if not verified or pending */}
        {(!kycStatus || (kycStatus !== 'verified' && kycStatus !== 'approved' && kycStatus !== 'pending')) && (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Verification Methods</Text>

            {/* ID Verification Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleStartVerification('id')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="card-outline" size={24} color="#0066A1" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Government ID</Text>
                <Text style={styles.optionDescription}>
                  Verify with your National ID, Driver's License, or Passport
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* BVN Verification Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleStartVerification('bvn')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="finger-print-outline" size={24} color="#0066A1" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>BVN Verification</Text>
                <Text style={styles.optionDescription}>
                  Quick verification using your Bank Verification Number
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Why Verify?</Text>

          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#28A745" />
            <Text style={styles.benefitText}>Enhanced account security</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="trending-up-outline" size={20} color="#28A745" />
            <Text style={styles.benefitText}>Higher transaction limits</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="flash-outline" size={20} color="#28A745" />
            <Text style={styles.benefitText}>Access to all features</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="lock-open-outline" size={20} color="#28A745" />
            <Text style={styles.benefitText}>Unlock savings and investment options</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
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
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E6F2F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
  },
  infoText: {
    fontSize: 13,
    color: '#0066A1',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  errorText: {
    color: '#DC3545',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 12,
    flex: 1,
  },
});