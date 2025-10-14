/**
 * Payment Error Screen
 *
 * Displays error details when payment fails via Paystack
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';

type Props = StackScreenProps<RootStackParamList, 'PaymentError'>;

export default function PaymentErrorScreen({ navigation, route }: Props) {
  const { reference, error } = route.params;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      // Shake animation for error icon
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleRetry = () => {
    // Go back to deposit screen to retry
    navigation.goBack();
  };

  const handleContactSupport = () => {
    // Navigate to support/help screen
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Main' },
      ],
    });
    // After reset, navigate to settings > help
    // This will be handled by the tab navigator
  };

  const handleGoHome = () => {
    // Navigate back to main screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const getErrorMessage = () => {
    if (error) {
      return error;
    }

    // Default error messages based on common scenarios
    return 'The payment could not be completed. This could be due to insufficient funds, network issues, or payment cancellation.';
  };

  const getErrorTitle = () => {
    if (error && error.toLowerCase().includes('cancel')) {
      return 'Payment Cancelled';
    }
    if (error && error.toLowerCase().includes('timeout')) {
      return 'Payment Timeout';
    }
    return 'Payment Failed';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#fef2f2', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Error Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnim }
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.iconGradient}
            >
              <Ionicons name="close" size={64} color="#ffffff" />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>{getErrorTitle()}</Text>
            <Text style={styles.subtitle}>
              We couldn't process your payment
            </Text>
          </Animated.View>

          {/* Error Details Card */}
          <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
            <View style={styles.errorMessageContainer}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorMessage}>{getErrorMessage()}</Text>
            </View>

            {reference && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference</Text>
                  <Text style={styles.detailValue}>{reference}</Text>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.statusText}>Failed</Text>
              </View>
            </View>
          </Animated.View>

          {/* Help Card */}
          <Animated.View style={[styles.helpCard, { opacity: fadeAnim }]}>
            <Ionicons name="information-circle" size={20} color="#6366f1" />
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                If you continue to experience issues, please contact our support team. No charges were made to your account.
              </Text>
            </View>
          </Animated.View>

          {/* Common Issues List */}
          <Animated.View style={[styles.issuesCard, { opacity: fadeAnim }]}>
            <Text style={styles.issuesTitle}>Common Issues:</Text>
            <View style={styles.issueItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.issueText}>Check your internet connection</Text>
            </View>
            <View style={styles.issueItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.issueText}>Ensure sufficient account balance</Text>
            </View>
            <View style={styles.issueItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.issueText}>Verify card details are correct</Text>
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleContactSupport}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Ionicons name="headset-outline" size={20} color="#374151" />
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleGoHome}
              style={[styles.secondaryButton, styles.halfButton]}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Go Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRetry}
              style={styles.halfButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0066A1', '#0077B5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    shadowColor: '#ef4444',
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
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    marginBottom: 16,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338ca',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: '#4338ca',
    lineHeight: 18,
  },
  issuesCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  issueText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  halfButton: {
    flex: 1,
  },
});
