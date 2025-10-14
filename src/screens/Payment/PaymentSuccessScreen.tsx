/**
 * Payment Success Screen
 *
 * Displays success animation and details after successful payment via Paystack
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import paymentsApi from '@/services/api/payments';

type Props = StackScreenProps<RootStackParamList, 'PaymentSuccess'>;

export default function PaymentSuccessScreen({ navigation, route }: Props) {
  const { reference, amount, packageType } = route.params;
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Verify payment with backend
    verifyPayment();

    // Start animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate checkmark
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const verifyPayment = async () => {
    try {
      // Call backend to verify payment
      const response = await paymentsApi.verifyPaymentTransaction(reference);
      setPaymentDetails(response);
      setVerifying(false);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setVerificationError(error.message || 'Failed to verify payment');
      setVerifying(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPackageTypeLabel = (type?: string) => {
    switch (type) {
      case 'daily_savings':
      case 'ds':
        return 'Daily Savings';
      case 'savings_buying':
      case 'sb':
        return 'SB Package';
      case 'interest_savings':
      case 'ibs':
        return 'Interest Package';
      default:
        return 'Package';
    }
  };

  const handleContinue = () => {
    // Navigate back to main screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewPackage = () => {
    // Navigate to package details
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
    // After reset, navigate to package tab
    // This will be handled by the tab navigator
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#f0fdf4', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.iconGradient}
            >
              <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                <Ionicons name="checkmark" size={64} color="#ffffff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>
              Your contribution has been processed
            </Text>
          </Animated.View>

          {/* Payment Details Card */}
          {verifying ? (
            <View style={styles.verifyingCard}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.verifyingText}>Verifying payment...</Text>
            </View>
          ) : verificationError ? (
            <View style={styles.errorCard}>
              <Ionicons name="warning" size={24} color="#f59e0b" />
              <Text style={styles.errorText}>{verificationError}</Text>
              <Text style={styles.errorSubtext}>
                Your payment was received but verification is pending
              </Text>
            </View>
          ) : (
            <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={styles.detailValue}>{reference}</Text>
              </View>

              <View style={styles.divider} />

              {amount && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailAmount}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {packageType && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Package Type</Text>
                    <Text style={styles.detailValue}>
                      {getPackageTypeLabel(packageType)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Success Message */}
          <Animated.View style={[styles.messageCard, { opacity: fadeAnim }]}>
            <Ionicons name="information-circle" size={20} color="#0066A1" />
            <Text style={styles.messageText}>
              Your balance has been updated and you'll receive a confirmation notification shortly.
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleViewPackage}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View Package</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  verifyingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  verifyingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#78350f',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
