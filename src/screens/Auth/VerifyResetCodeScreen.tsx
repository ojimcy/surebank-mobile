/**
 * Verify Reset Code Screen
 * Allows users to enter the verification code sent to their email
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import authService from '@/services/api/auth';
import type { AuthScreenProps } from '@/navigation/types';

const { width } = Dimensions.get('window');

export default function VerifyResetCodeScreen({ navigation, route }: AuthScreenProps<'VerifyResetCode'>) {
  const { email } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Navigate back if no email provided
  useEffect(() => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email is required. Please try again.',
        position: 'top',
      });
      navigation.navigate('ForgotPassword');
    }
  }, [email, navigation]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    if (text && !/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text.slice(-1); // Take only the last character
    setCode(newCode);

    // Move to next input if a digit was entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter all 6 digits',
        position: 'top',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyResetCode({ code: fullCode, email });

      Toast.show({
        type: 'success',
        text1: 'Code Verified',
        text2: 'Please set your new password',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigate to reset password screen
      navigation.navigate('ResetPassword', { email, code: fullCode });
    } catch (error: any) {
      console.error('Code verification failed:', error);

      const errorMessage = error?.message || 'Invalid verification code. Please try again.';

      if (errorMessage.includes('expired')) {
        Toast.show({
          type: 'error',
          text1: 'Code Expired',
          text2: 'Please request a new code',
          position: 'top',
          visibilityTime: 4000,
        });
      } else if (errorMessage.includes('attempts')) {
        Toast.show({
          type: 'error',
          text1: 'Too Many Attempts',
          text2: 'Please request a new code',
          position: 'top',
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset({ email });

      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: 'A new verification code has been sent',
        position: 'top',
        visibilityTime: 3000,
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Resend Failed',
        text2: 'Please try again later',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format email for display
  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 3) + '*'.repeat(Math.max(0, username.length - 3));
    return `${maskedUsername}@${domain}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066A1" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={['#0066A1', '#0077B5', '#0088CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Icon and Title */}
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-open-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.headerTitle}>Verify Code</Text>
              <Text style={styles.headerSubtitle}>
                Enter the 6-digit code sent to{'\n'}
                {email && formatEmail(email)}
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Code Input */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Verification Code</Text>
              <View style={styles.codeInputs}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      isLoading && styles.codeInputDisabled,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    editable={!isLoading}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || code.some((d) => !d)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading || code.some((d) => !d) ? ['#9ca3af', '#9ca3af'] : ['#0066A1', '#0077B5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.submitButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>Verify Code</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive a code? </Text>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isLoading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>Resend in {countdown}s</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  codeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
    backgroundColor: '#ffffff',
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
  codeInputFilled: {
    borderColor: '#0066A1',
    backgroundColor: '#eff6ff',
  },
  codeInputDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0066A1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  submitButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#6b7280',
    fontSize: 15,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  resendLink: {
    color: '#0066A1',
    fontSize: 15,
    fontWeight: '600',
  },
  countdownText: {
    color: '#6b7280',
    fontSize: 15,
  },
});