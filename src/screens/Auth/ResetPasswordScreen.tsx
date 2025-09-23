/**
 * Reset Password Screen
 * Allows users to set a new password after verification
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/forms';
import authService from '@/services/api/auth';
import type { AuthScreenProps } from '@/navigation/types';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen({ navigation, route }: AuthScreenProps<'ResetPassword'>) {
  const { email, code } = route.params || {};
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Navigate back if no email or code provided
  useEffect(() => {
    if (!email || !code) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Verification data is missing. Please try again.',
        position: 'top',
      });
      navigation.navigate('ForgotPassword');
    }
  }, [email, code, navigation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        code,
        password: formData.password,
      });

      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'You can now login with your new password',
        position: 'top',
        visibilityTime: 3000,
      });

      // Navigate to login with success message
      navigation.navigate('Login', {
        message: 'Password reset successful. Please sign in with your new password.',
      });
    } catch (error: any) {
      console.error('Password reset failed:', error);

      const errorMessage = error?.message || 'Password reset failed. Please try again.';

      if (errorMessage.includes('expired') || errorMessage.includes('invalid session')) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please restart the password reset process',
          position: 'top',
          visibilityTime: 4000,
        });
        navigation.navigate('ForgotPassword');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
                <Ionicons name="key-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.headerTitle}>Set New Password</Text>
              <Text style={styles.headerSubtitle}>
                Create a new password for{' \n'}
                {email && formatEmail(email)}
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              <Input
                label="New Password"
                placeholder="Enter your new password"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                errorText={errors.password}
                editable={!isLoading}
                autoComplete="password-new"
                helperText={!errors.password ? "At least 8 characters with uppercase, lowercase, and numbers" : undefined}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                errorText={errors.confirmPassword}
                editable={!isLoading}
                autoComplete="password-new"
              />

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={formData.password.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={formData.password.length >= 8 ? "#10b981" : "#9ca3af"}
                  />
                  <Text style={[styles.requirementText, formData.password.length >= 8 && styles.requirementMet]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/[A-Z]/.test(formData.password) ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={/[A-Z]/.test(formData.password) ? "#10b981" : "#9ca3af"}
                  />
                  <Text style={[styles.requirementText, /[A-Z]/.test(formData.password) && styles.requirementMet]}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/[a-z]/.test(formData.password) ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={/[a-z]/.test(formData.password) ? "#10b981" : "#9ca3af"}
                  />
                  <Text style={[styles.requirementText, /[a-z]/.test(formData.password) && styles.requirementMet]}>
                    One lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/\d/.test(formData.password) ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={/\d/.test(formData.password) ? "#10b981" : "#9ca3af"}
                  />
                  <Text style={[styles.requirementText, /\d/.test(formData.password) && styles.requirementMet]}>
                    One number
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading || !formData.password || !formData.confirmPassword ? ['#9ca3af', '#9ca3af'] : ['#0066A1', '#0077B5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.submitButtonText}>Updating...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>Set New Password</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.backToLoginContainer}>
              <Text style={styles.backToLoginText}>Remember your password? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
                style={styles.backToLoginButton}
              >
                <Text style={styles.backToLoginLink}>Sign In</Text>
              </TouchableOpacity>
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
  formContainer: {
    marginBottom: 32,
    gap: 16,
  },
  requirementsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  requirementMet: {
    color: '#10b981',
    fontWeight: '500',
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
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#6b7280',
    fontSize: 15,
  },
  backToLoginButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backToLoginLink: {
    color: '#0066A1',
    fontSize: 15,
    fontWeight: '600',
  },
});