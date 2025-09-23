/**
 * Professional Register Screen
 * Beautiful and modern banking app registration design
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
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/forms';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthScreenProps } from '@/navigation/types';

const { width } = Dimensions.get('window');

interface RegisterFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface CountryCode {
  code: string;
  flag: string;
  name: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria', dialCode: '+234' },
];

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  console.log('[RegisterScreen] Rendering');

  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]); // Default to Nigeria

  const validatePhoneNumber = (phone: string, country: CountryCode): boolean => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (country.code === 'NG') {
      // Nigerian phone number validation
      // Supports: 08057172283, 8057172283, +2348057172283, formatted versions

      // Remove country code if present
      const phoneWithoutCountryCode = cleanPhone.replace(/^(\+234|234)/, '');

      // Check if it's 11 digits starting with 0 and valid network prefix
      if (/^0[789]\d{9}$/.test(phoneWithoutCountryCode)) {
        return true;
      }

      // Check if it's 10 digits with valid network prefix (without leading 0)
      if (/^[789]\d{9}$/.test(phoneWithoutCountryCode)) {
        return true;
      }

      return false;
    }

    // General validation for other countries
    const phoneRegex = /^[\+]?[1-9][\d]{6,14}$/;
    return phoneRegex.test(cleanPhone);
  };

  const formatPhoneForSubmission = (phone: string, country: CountryCode): string => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (country.code === 'NG') {
      // Remove country code if present
      let phoneWithoutCountryCode = cleanPhone.replace(/^(\+234|234)/, '');

      // If it's 10 digits, add leading 0
      if (/^[789]\d{9}$/.test(phoneWithoutCountryCode)) {
        phoneWithoutCountryCode = '0' + phoneWithoutCountryCode;
      }

      // Return with country code
      return '+234' + phoneWithoutCountryCode.substring(1);
    }

    // For other countries, ensure it starts with country code
    if (!cleanPhone.startsWith(country.dialCode)) {
      return country.dialCode + cleanPhone;
    }

    return cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const isValidPhone = validatePhoneNumber(formData.phoneNumber, selectedCountry);
      if (!isValidPhone) {
        if (selectedCountry.code === 'NG') {
          newErrors.phoneNumber = 'Enter 11 digits (e.g., 08057172283) or 10 digits (e.g., 8057172283)';
        } else {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        }
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      const formattedPhone = formatPhoneForSubmission(formData.phoneNumber, selectedCountry);

      // Split name into firstName and lastName
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await register({
        firstName,
        lastName,
        email: formData.email.trim(),
        phoneNumber: formattedPhone,
        address: formData.address.trim(),
        password: formData.password,
      });

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Account Created Successfully!',
        text2: 'Please log in with your credentials',
        position: 'top',
        visibilityTime: 3000,
      });

      // Navigate to login screen with success message
      console.log('[RegisterScreen] Registration successful, navigating to login');
      navigation.navigate('Login', {
        message: 'Your account has been created successfully. Please log in to continue.',
        prefilledIdentifier: formData.email.trim() || formattedPhone,
      });
    } catch (err: any) {
      console.error('Registration error:', err);

      // Use the actual error message from the server, or fall back to a generic one
      let errorMessage = err?.message || 'Registration failed. Please try again.';

      // Check for specific error patterns and provide user-friendly messages
      if (err?.message?.toLowerCase().includes('email already') ||
          err?.message?.includes('ACCOUNT_EXISTS') ||
          err?.message?.toLowerCase().includes('email is already taken')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err?.message?.toLowerCase().includes('phone already')) {
        errorMessage = 'This phone number is already registered. Please use a different number or try logging in.';
      } else if (err?.message?.includes('timeout')) {
        errorMessage = 'Registration request timed out. Please check your connection and try again.';
      } else if (err?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const formatPhoneInput = (value: string, country: CountryCode): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    if (country.code === 'NG') {
      // For Nigerian numbers, add spacing for readability
      if (digitsOnly.length <= 4) {
        return digitsOnly;
      } else if (digitsOnly.length <= 7) {
        return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
      } else if (digitsOnly.length <= 11) {
        return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
      }
      // Limit to 11 digits for Nigerian numbers
      return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 11)}`;
    }

    return digitsOnly;
  };

  const updateField = (field: keyof RegisterFormData, value: string) => {
    let processedValue = value;

    // Format phone number as user types
    if (field === 'phoneNumber') {
      processedValue = formatPhoneInput(value, selectedCountry);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
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
                <Ionicons name="person-add" size={32} color="#ffffff" />
              </View>
              <Text style={styles.brandText}>Join SureBank</Text>
              <Text style={styles.brandSubtext}>Create your secure banking account</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Get Started</Text>
              <Text style={styles.welcomeSubtitle}>
                Create your account and start your financial journey with us
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Registration Form */}
            <View style={styles.formContainer}>
              {/* Personal Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  errorText={errors.name}
                  editable={!isLoading}
                />

                {/* Contact Fields */}
                <Input
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  errorText={errors.email}
                  editable={!isLoading}
                />

                {/* Phone Number with Country Selector */}
                <View style={styles.phoneContainer}>
                  <Text style={styles.phoneLabel}>Phone Number</Text>
                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={styles.countrySelector}
                      onPress={() => {
                        // For now, cycle through country codes. In a real app, you'd show a picker
                        const currentIndex = countryCodes.findIndex(c => c.code === selectedCountry.code);
                        const nextIndex = (currentIndex + 1) % countryCodes.length;
                        setSelectedCountry(countryCodes[nextIndex]);
                      }}
                      disabled={isLoading}
                    >
                      <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                      <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6b7280" />
                    </TouchableOpacity>
                    <View style={styles.phoneInputWrapper}>
                      <Input
                        placeholder={'Enter phone number'}
                        value={formData.phoneNumber}
                        onChangeText={(text) => updateField('phoneNumber', text)}
                        keyboardType="phone-pad"
                        errorText={errors.phoneNumber}
                        editable={!isLoading}
                        style={styles.phoneInput}
                      />
                    </View>
                  </View>
                </View>

                <Input
                  label="Address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChangeText={(text) => updateField('address', text)}
                  leftIcon="location-outline"
                  autoCapitalize="sentences"
                  errorText={errors.address}
                  editable={!isLoading}
                  multiline
                />
              </View>

              {/* Security Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Security</Text>

                {/* Password Fields */}
                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  leftIcon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  errorText={errors.password}
                  editable={!isLoading}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  leftIcon="lock-closed-outline"
                  secureTextEntry={!showConfirmPassword}
                  rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  errorText={errors.confirmPassword}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setAgreeToTerms(!agreeToTerms);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                style={styles.checkboxContainer}
                disabled={isLoading}
              >
                <View style={[
                  styles.checkbox,
                  agreeToTerms && styles.checkboxActive,
                  errors.terms && styles.checkboxError
                ]}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                  {errors.terms && (
                    <Text style={styles.termsError}>{errors.terms}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#9ca3af'] : ['#0066A1', '#0077B5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.registerButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInPrompt}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
                style={styles.signInButton}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <View style={styles.securityIcon}>
                <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              </View>
              <Text style={styles.securityText}>
                Your information is encrypted and secured with bank-level security
              </Text>
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
    gap: 20,
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  // Terms Styles
  termsContainer: {
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#0066A1',
    borderColor: '#0066A1',
  },
  checkboxError: {
    borderColor: '#ef4444',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#0066A1',
    fontWeight: '600',
  },
  termsError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Button Styles
  registerButton: {
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
  registerButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  registerButtonGradient: {
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
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInPrompt: {
    color: '#6b7280',
    fontSize: 15,
  },
  signInButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  signInText: {
    color: '#0066A1',
    fontSize: 15,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    flex: 1,
    color: '#166534',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  // Phone Input Styles
  phoneContainer: {
    marginBottom: 16,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
    minWidth: 100,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    // Additional styles if needed
  },
});