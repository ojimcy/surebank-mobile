/**
 * Clean Register Screen - No complex dependencies
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/forms';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthScreenProps } from '@/navigation/types';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  console.log('[RegisterScreen] Rendering');

  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phoneNumber.trim()) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      if (!phoneRegex.test(formData.phoneNumber) || cleanPhone.length < 10) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        password: formData.password,
      });

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email to verify your account.',
        position: 'top',
        visibilityTime: 4000,
      });

      // Navigate to verification screen
      setTimeout(() => {
        navigation.navigate('Verification', { identifier: formData.email });
      }, 1500);

    } catch (err: any) {
      console.error('Registration error:', err);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: err?.message || 'Unable to create account. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 16
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#6b7280" />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

          <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 8 }}>
            {/* Welcome Message */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 8
              }}>
                Create Account
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280' }}>
                Join SureBank and start managing your finances
              </Text>
            </View>

            {/* Error Display */}
            {error && (
              <View style={{
                backgroundColor: '#fee2e2',
                borderWidth: 1,
                borderColor: '#fecaca',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={{
                  color: '#ef4444',
                  marginLeft: 8,
                  flex: 1
                }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={{ gap: 16 }}>
              {/* Name Fields Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    leftIcon="person-outline"
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    autoCapitalize="words"
                    errorText={errors.firstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    leftIcon="person-outline"
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    autoCapitalize="words"
                    errorText={errors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                leftIcon="mail-outline"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                errorText={errors.email}
              />

              <Input
                label="Phone Number (Optional)"
                placeholder="+1 234 567 8900"
                leftIcon="call-outline"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField('phoneNumber', text)}
                keyboardType="phone-pad"
                errorText={errors.phoneNumber}
              />

              <Input
                label="Password"
                placeholder="Enter a strong password"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                errorText={errors.password}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                leftIcon="lock-closed-outline"
                rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                errorText={errors.confirmPassword}
              />

              {/* Terms and Conditions */}
              <TouchableOpacity
                onPress={() => {
                  setAgreeToTerms(!agreeToTerms);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: 8
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderWidth: 1,
                  borderColor: errors.terms ? '#ef4444' : '#d1d5db',
                  borderRadius: 4,
                  marginRight: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: agreeToTerms ? '#0066A1' : '#e5e7eb'
                }}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                    I agree to the{' '}
                    <Text style={{ color: '#0066A1', fontWeight: '600' }}>
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text style={{ color: '#0066A1', fontWeight: '600' }}>
                      Privacy Policy
                    </Text>
                  </Text>
                  {errors.terms && (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                      {errors.terms}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#6b7280' : '#0066A1',
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 32,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  Creating Account...
                </Text>
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="white" />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    Create Account
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{
              alignItems: 'center',
              marginTop: 32,
              marginBottom: 24
            }}>
              <Text style={{ color: '#6b7280', marginBottom: 12 }}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={{ padding: 8 }}
              >
                <Text style={{
                  color: '#0066A1',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}