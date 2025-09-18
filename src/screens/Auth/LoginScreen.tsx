/**
 * Clean Login Screen - No complex dependencies
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
import { storage, STORAGE_KEYS } from '@/services/storage';
import type { AuthScreenProps } from '@/navigation/types';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  console.log('[LoginScreen] Rendering');

  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
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
        text2: 'Welcome back to SureBank!',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigation will be handled by auth context after successful login
    } catch (err: any) {
      console.error('Login error:', err);

      let errorMessage = 'Invalid email/phone or password. Please try again.';

      if (err?.message?.includes('timeout')) {
        errorMessage = 'Login request timed out. Please check your connection and try again.';
      } else if (err?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err?.code === 'NETWORK_UNAVAILABLE') {
        errorMessage = 'No internet connection. Please check your network.';
      }

      // Show error toast
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
                Welcome back
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280' }}>
                Sign in to your SureBank account to continue
              </Text>
            </View>

            {/* Error Display - kept for immediate feedback */}
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
                  color: '#991b1b',
                  marginLeft: 8,
                  flex: 1
                }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={{ gap: 16 }}>
              <Input
                label="Email or Phone Number"
                placeholder="Enter your email or phone"
                leftIcon="mail-outline"
                value={formData.identifier}
                onChangeText={(text) => updateField('identifier', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                errorText={errors.identifier}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                errorText={errors.password}
              />

              {/* Forgot Password */}
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={{ padding: 4 }}
                >
                  <Text style={{ color: '#0066A1', fontSize: 14 }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9ca3af' : '#0066A1',
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 32,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  Signing in...
                </Text>
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    Sign In
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={{
              alignItems: 'center',
              marginTop: 32,
              marginBottom: 24
            }}>
              <Text style={{ color: '#6b7280', marginBottom: 12 }}>
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{ padding: 8 }}
              >
                <Text style={{
                  color: '#0066A1',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Create Account
                </Text>
              </TouchableOpacity>
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
                style={{
                  alignItems: 'center',
                  paddingVertical: 8,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                  [Dev] Reset Onboarding
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}