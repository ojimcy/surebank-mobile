/**
 * Add Card Screen
 * Allows users to add a new payment card with Paystack verification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '@/contexts/AuthContext';
import { useCardsQuery } from '@/hooks/queries/useCardsQuery';
import type { CardsScreenProps } from '@/navigation/types';
import { usePaystack } from 'react-native-paystack-webview';
import { useAuth } from '@/contexts/AuthContext';

type CardType = 'visa' | 'mastercard' | 'verve' | 'unknown';

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface ValidationStatus {
  cardNumber: boolean | null;
  expiryMonth: boolean | null;
  expiryYear: boolean | null;
  cvv: boolean | null;
}

function AddCardScreen({ navigation }: CardsScreenProps<'AddCard'>) {
  // Temporarily disable auth to isolate the error
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    console.warn('Auth context not available:', error);
  }

  const { storeCardAsync, isStoreCardLoading } = useCardsQuery();

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [validation, setValidation] = useState<ValidationStatus>({
    cardNumber: null,
    expiryMonth: null,
    expiryYear: null,
    cvv: null,
  });

  const [showCvv, setShowCvv] = useState(false);
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Paystack hook
  const { popup } = usePaystack();

  // Detect card type from number
  const detectCardType = (cardNumber: string): CardType => {
    const cleaned = cardNumber.replace(/\D/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^(506099|506188|650002|650003)/.test(cleaned)) return 'verve';

    return 'unknown';
  };

  // Luhn algorithm for card validation
  const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);

      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }

      sum += n;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,19}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : v;
  };

  // Validate individual fields
  const validateField = (field: keyof CardFormData, value: string): boolean => {
    switch (field) {
      case 'cardNumber':
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && luhnCheck(cleaned);
      case 'expiryMonth':
        const month = parseInt(value);
        return month >= 1 && month <= 12;
      case 'expiryYear':
        const currentYear = new Date().getFullYear() % 100;
        const inputYear = parseInt(value);
        return inputYear >= currentYear && inputYear <= currentYear + 20;
      case 'cvv':
        return value.length >= 3 && value.length <= 4;
      default:
        return false;
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CardFormData, value: string) => {
    let processedValue = value;

    // Process based on field type
    if (field === 'cardNumber') {
      processedValue = value.replace(/\D/g, '');
      setCardType(detectCardType(processedValue));
    } else if (field === 'expiryMonth' || field === 'expiryYear' || field === 'cvv') {
      processedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Validate field
    if (processedValue) {
      const isValid = validateField(field, processedValue);
      setValidation(prev => ({ ...prev, [field]: isValid }));
    } else {
      setValidation(prev => ({ ...prev, [field]: null }));
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return Object.values(validation).every(status => status === true) &&
           Object.values(formData).every(value => value.trim() !== '');
  };

  // Generate payment reference
  const generateReference = (): string => {
    return `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please fill in all card details correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize Paystack payment using the popup.checkout method
      popup.checkout({
        amount: 100, // 1 NGN in kobo (for card verification)
        email: user?.email || 'customer@surebank.ng',
        reference: generateReference(),
        onSuccess: async (response: any) => {
          try {
            // Store the card after successful verification
            await storeCardAsync({
              paystackReference: response.reference,
              setAsDefault: false,
            });

            Alert.alert(
              'Success',
              'Your card has been added successfully!',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } catch (error) {
            console.error('Error storing card:', error);
            Alert.alert('Error', 'Card verified but failed to save. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: () => {
          Alert.alert('Cancelled', 'Card verification was cancelled.');
          setIsSubmitting(false);
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          Alert.alert('Error', 'Failed to verify card. Please try again.');
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get card type display info
  const getCardTypeInfo = () => {
    switch (cardType) {
      case 'visa':
        return { name: 'Visa', color: '#1A1F71' };
      case 'mastercard':
        return { name: 'Mastercard', color: '#EB001B' };
      case 'verve':
        return { name: 'Verve', color: '#00A859' };
      default:
        return { name: 'Card', color: '#6b7280' };
    }
  };

  const cardTypeInfo = getCardTypeInfo();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={[styles.card, { backgroundColor: cardTypeInfo.color || '#0066A1' }]}>
              {/* Card Front */}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTypeName}>{cardTypeInfo.name}</Text>
                  <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                </View>

                <View style={styles.cardMiddle}>
                  <Text style={styles.cardNumber}>
                    {formatCardNumber(formData.cardNumber) || '•••• •••• •••• ••••'}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>VALID THRU</Text>
                    <Text style={styles.cardValue}>
                      {formData.expiryMonth || 'MM'}/{formData.expiryYear || 'YY'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>CVV</Text>
                    <Text style={styles.cardValue}>
                      {showCvv && formData.cvv ? formData.cvv : '•••'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Verification Notice */}
          <View style={styles.noticeCard}>
            <Ionicons name="information-circle" size={24} color="#0066A1" />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Card Verification</Text>
              <Text style={styles.noticeText}>
                We'll charge ₦1 to verify your card. This amount will be refunded immediately.
                Your card details are encrypted and CVV is never stored.
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    validation.cardNumber === false && styles.inputError,
                    validation.cardNumber === true && styles.inputSuccess,
                  ]}
                  placeholder="0000 0000 0000 0000"
                  value={formatCardNumber(formData.cardNumber)}
                  onChangeText={(text) => handleInputChange('cardNumber', text)}
                  keyboardType="numeric"
                  maxLength={23}
                />
                {validation.cardNumber !== null && (
                  <Ionicons
                    name={validation.cardNumber ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={validation.cardNumber ? '#10B981' : '#EF4444'}
                    style={styles.inputIcon}
                  />
                )}
              </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry Month</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      validation.expiryMonth === false && styles.inputError,
                      validation.expiryMonth === true && styles.inputSuccess,
                    ]}
                    placeholder="MM"
                    value={formData.expiryMonth}
                    onChangeText={(text) => handleInputChange('expiryMonth', text)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Expiry Year</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      validation.expiryYear === false && styles.inputError,
                      validation.expiryYear === true && styles.inputSuccess,
                    ]}
                    placeholder="YY"
                    value={formData.expiryYear}
                    onChangeText={(text) => handleInputChange('expiryYear', text)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            {/* CVV */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>CVV</Text>
                <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                  <Ionicons
                    name={showCvv ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    validation.cvv === false && styles.inputError,
                    validation.cvv === true && styles.inputSuccess,
                  ]}
                  placeholder="123"
                  value={formData.cvv}
                  onChangeText={(text) => handleInputChange('cvv', text)}
                  keyboardType="numeric"
                  secureTextEntry={!showCvv}
                  maxLength={4}
                />
                {validation.cvv !== null && (
                  <Ionicons
                    name={validation.cvv ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={validation.cvv ? '#10B981' : '#EF4444'}
                    style={styles.inputIcon}
                  />
                )}
              </View>
              <Text style={styles.helpText}>3-4 digit code on the back of your card</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isSubmitting || isStoreCardLoading}
            >
              {isSubmitting || isStoreCardLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>
                    Verify & Add Card (₦1)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={20} color="#10B981" />
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Bank-level Security</Text>
                <Text style={styles.securityText}>
                  Your card data is encrypted with industry-standard security
                </Text>
              </View>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>PCI Compliant</Text>
                <Text style={styles.securityText}>
                  We follow strict payment card industry standards
                </Text>
              </View>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="eye-off" size={20} color="#10B981" />
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>CVV Not Stored</Text>
                <Text style={styles.securityText}>
                  Your CVV is never stored on our servers
                </Text>
              </View>
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
    backgroundColor: '#f8f9fa',
  },
  cardPreview: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 18,
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#ffffff',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066A1',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputSuccess: {
    borderColor: '#10B981',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#0066A1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  securityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

// Set display name for debugging
AddCardScreen.displayName = 'AddCardScreen';

export default AddCardScreen;