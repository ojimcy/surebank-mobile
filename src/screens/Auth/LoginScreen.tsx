/**
 * Professional Login Screen
 * Beautiful and modern banking app authentication design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/forms';
import { useAuth } from '@/contexts/AuthContext';
import { storage, STORAGE_KEYS } from '@/services/storage';
import type { AuthScreenProps } from '@/navigation/types';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }: AuthScreenProps<'Login'>) {

  const { message, prefilledIdentifier } = route.params || {};
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    identifier: prefilledIdentifier || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back to SureBank Stores!',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigation will be handled by auth context after successful login
    } catch (err: any) {
      console.error('Login error:', err);

      // Use the actual error message from the API
      const errorMessage = err?.message || 'Login failed. Please try again.';

      // Show error toast with the actual error message
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Logo/Brand Section */}
            <View style={styles.brandSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
              </View>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to access your account Go Beyond Limits , Go for Your
                Goals
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Success Message Display */}
            {message && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text style={styles.successText}>{message}</Text>
              </View>
            )}

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Input
                label="Email or Phone"
                placeholder="Enter your email or phone number"
                value={formData.identifier}
                onChangeText={(text) => updateField('identifier', text)}
                leftIcon="person-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                errorText={errors.identifier}
                editable={!isLoading}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                errorText={errors.password}
                editable={!isLoading}
              />
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isLoading ? ['#9ca3af', '#9ca3af'] : ['#0066A1', '#0077B5']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpPrompt}>
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={isLoading}
                style={styles.signUpButton}
              >
                <Text style={styles.signUpText}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing in, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Dev Option: Reset Onboarding (only in dev mode) */}
            {__DEV__ && (
              <TouchableOpacity
                onPress={async () => {
                  await storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
                  Toast.show({
                    type: 'info',
                    text1: 'Onboarding Reset',
                    text2: 'Restart the app to see onboarding again',
                    position: 'top',
                  });
                }}
                style={styles.devButton}
              >
                <Text style={styles.devText}>[Dev] Reset Onboarding</Text>
              </TouchableOpacity>
            )}
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
    paddingBottom: 40, // Extra spacing to prevent overlap with phone navigation buttons
  },
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  brandSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  // Form Styles
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successIcon: {
    padding: 2,
  },
  successText: {
    flex: 1,
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
    gap: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    color: '#0066A1',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  loginButtonGradient: {
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
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    gap: 12,
  },
  biometricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 161, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpPrompt: {
    color: '#6b7280',
    fontSize: 15,
  },
  signUpButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  signUpText: {
    color: '#0066A1',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 32,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#0066A1',
    fontWeight: '500',
  },
  devButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  devText: {
    color: '#9ca3af',
    fontSize: 12,
  },
});