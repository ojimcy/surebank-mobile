/**
 * Change Password Screen
 * Allows users to change their account password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/api/auth';
import type { SettingsScreenProps } from '@/navigation/types';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'One number',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&*)',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

export default function ChangePasswordScreen({ navigation }: SettingsScreenProps<'ChangePassword'>) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  };

  const getPasswordStrength = (password: string): { label: string; color: string; percentage: number } => {
    const passedRequirements = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
    const percentage = (passedRequirements / PASSWORD_REQUIREMENTS.length) * 100;

    if (percentage === 0) {
      return { label: '', color: '#e5e7eb', percentage: 0 };
    } else if (percentage < 40) {
      return { label: 'Weak', color: '#ef4444', percentage };
    } else if (percentage < 80) {
      return { label: 'Fair', color: '#f59e0b', percentage };
    } else if (percentage < 100) {
      return { label: 'Good', color: '#3b82f6', percentage };
    } else {
      return { label: 'Strong', color: '#10b981', percentage };
    }
  };

  const handleChangePassword = async () => {
    // Reset errors
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Validation
    let hasError = false;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      hasError = true;
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      hasError = true;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password does not meet requirements';
      hasError = true;
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Make API call
    setIsLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setIsLoading(false);

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Your password has been changed successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Navigate back
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      setIsLoading(false);

      const errorMessage = error?.message || 'Failed to change password. Please try again.';

      if (error?.code === 'INCORRECT_PASSWORD') {
        setErrors((prev) => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }));
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Info */}
        <View style={styles.header}>
          <Ionicons name="key-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>Change Password</Text>
          <Text style={styles.headerDescription}>
            Keep your account secure by using a strong password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.currentPassword && styles.inputError]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setErrors((prev) => ({ ...prev, currentPassword: '' }));
                }}
                placeholder="Enter your current password"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.newPassword && styles.inputError]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                placeholder="Enter your new password"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${strength.percentage}%`,
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
                {strength.label && (
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Re-enter your new password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            {PASSWORD_REQUIREMENTS.map((req) => {
              const isMet = req.test(newPassword);
              return (
                <View key={req.id} style={styles.requirement}>
                  <Ionicons
                    name={isMet ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={isMet ? '#10b981' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      isMet && styles.requirementTextMet,
                    ]}
                  >
                    {req.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
          <Text style={styles.infoText}>
            Choose a strong password that you don't use for other accounts. Never share your
            password with anyone.
          </Text>
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
  headerDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 48,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
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
  inputError: {
    borderColor: '#ef4444',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  requirementsContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#6b7280',
  },
  requirementTextMet: {
    color: '#10b981',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066A1',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
