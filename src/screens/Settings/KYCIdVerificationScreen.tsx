/**
 * KYC ID Verification Screen
 *
 * Multi-step form for ID-based KYC verification
 * Steps: Personal Info → ID Details → Document Upload → Review & Submit
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import type { SettingsScreenProps } from '@/navigation/types';
import kycApi from '@/services/api/kyc';
import imageUploadService from '@/services/upload/imageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { DateInput, Dropdown } from '@/components/forms';
import type { DropdownOption } from '@/components/forms';
import { format } from 'date-fns';

// Types
type IdType = 'national_id' | 'drivers_license' | 'passport' | 'voters_card';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

interface IdInfo {
  idType: IdType | '';
  idNumber: string;
  expiryDate: string;
}

interface DocumentImages {
  idImage: {
    uri: string;
    uploaded: boolean;
    uploading: boolean;
  } | null;
  selfieImage: {
    uri: string;
    uploaded: boolean;
    uploading: boolean;
  } | null;
}

const ID_TYPES: DropdownOption[] = [
  { value: 'national_id', label: 'National ID Card', icon: 'card-outline' },
  { value: 'drivers_license', label: "Driver's License", icon: 'car-outline' },
  { value: 'passport', label: 'International Passport', icon: 'airplane-outline' },
  { value: 'voters_card', label: "Voter's Card", icon: 'finger-print-outline' },
];

const GENDER_OPTIONS: DropdownOption[] = [
  { value: 'male', label: 'Male', icon: 'male-outline' },
  { value: 'female', label: 'Female', icon: 'female-outline' },
  { value: 'other', label: 'Other', icon: 'person-outline' },
];

export default function KYCIdVerificationScreen({ navigation }: SettingsScreenProps<'KYCIdVerification'>) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: '',
    gender: '',
    address: user?.address || '',
  });

  const [idInfo, setIdInfo] = useState<IdInfo>({
    idType: '',
    idNumber: '',
    expiryDate: '',
  });

  const [documents, setDocuments] = useState<DocumentImages>({
    idImage: null,
    selfieImage: null,
  });

  const [errors, setErrors] = useState<any>({});

  const steps = [
    'Personal Information',
    'ID Details',
    'Upload Documents',
    'Review & Submit',
  ];

  // Validation functions
  const validatePersonalInfo = (): boolean => {
    const newErrors: any = {};

    if (!personalInfo.firstName) newErrors.firstName = 'First name is required';
    if (!personalInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!personalInfo.gender) newErrors.gender = 'Gender is required';
    if (!personalInfo.address) newErrors.address = 'Address is required';

    // The DateInput component now handles age validation internally
    // Just check if the date is provided

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIdInfo = (): boolean => {
    const newErrors: any = {};

    if (!idInfo.idType) newErrors.idType = 'ID type is required';
    if (!idInfo.idNumber) newErrors.idNumber = 'ID number is required';
    if (!idInfo.expiryDate) newErrors.expiryDate = 'Expiry date is required';

    // The DateInput component now handles expiry date validation internally
    // Just check if the date is provided

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = (): boolean => {
    const newErrors: any = {};

    if (!documents.idImage?.uploaded) newErrors.idImage = 'Please upload your ID document';
    if (!documents.selfieImage?.uploaded) newErrors.selfieImage = 'Please upload a selfie';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker functions
  const pickImage = async (type: 'idImage' | 'selfieImage') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'idImage' ? [4, 3] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type]: {
            uri: result.assets[0].uri,
            uploaded: false,
            uploading: true,
          },
        }));

        // Simulate upload (replace with actual upload)
        setTimeout(() => {
          setDocuments(prev => ({
            ...prev,
            [type]: {
              uri: result.assets[0].uri,
              uploaded: true,
              uploading: false,
            },
          }));
          Toast.show({
            type: 'success',
            text1: 'Upload Successful',
            text2: type === 'idImage' ? 'ID document uploaded' : 'Selfie uploaded',
          });
        }, 2000);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const takePhoto = async (type: 'selfieImage') => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type]: {
            uri: result.assets[0].uri,
            uploaded: false,
            uploading: true,
          },
        }));

        // Simulate upload
        setTimeout(() => {
          setDocuments(prev => ({
            ...prev,
            [type]: {
              uri: result.assets[0].uri,
              uploaded: true,
              uploading: false,
            },
          }));
          Toast.show({
            type: 'success',
            text1: 'Upload Successful',
            text2: 'Selfie uploaded',
          });
        }, 2000);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to take photo',
      });
    }
  };

  // Navigation functions
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 0:
        isValid = validatePersonalInfo();
        break;
      case 1:
        isValid = validateIdInfo();
        break;
      case 2:
        isValid = validateDocuments();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  // Submit KYC
  const submitKycMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        kycType: 'id' as const,
        idType: idInfo.idType,
        idNumber: idInfo.idNumber,
        idImage: documents.idImage?.uri || '',
        selfieImage: documents.selfieImage?.uri || '',
        expiryDate: idInfo.expiryDate,
        address: personalInfo.address,
        dateOfBirth: personalInfo.dateOfBirth,
        phoneNumber: user?.phoneNumber || '',
      };

      return kycApi.submitIdVerification(payload);
    },
    onSuccess: () => {
      navigation.navigate('KYCSuccess');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Failed to submit KYC verification',
      });
    },
  });

  const handleSubmit = () => {
    submitKycMutation.mutate();
  };

  // Step indicator component
  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              index <= currentStep && styles.stepCircleActive,
              index < currentStep && styles.stepCircleCompleted,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}>
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ID Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator */}
        <StepIndicator />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Personal Information</Text>
              <Text style={styles.stepDescription}>
                Please provide your personal details exactly as they appear on your ID
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={personalInfo.firstName}
                  onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={personalInfo.lastName}
                  onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>

              <View style={styles.formGroup}>
                <DateInput
                  label="Date of Birth"
                  value={personalInfo.dateOfBirth}
                  onDateChange={(date) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: date ? format(date, 'yyyy-MM-dd') : '' }))}
                  placeholder="DD/MM/YYYY"
                  maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                  errorText={errors.dateOfBirth}
                  helperText="You must be at least 18 years old"
                  required
                />
              </View>

              <View style={styles.formGroup}>
                <Dropdown
                  label="Gender"
                  value={personalInfo.gender}
                  options={GENDER_OPTIONS}
                  onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, gender: String(value) }))}
                  placeholder="Select your gender"
                  errorText={errors.gender}
                  required
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                  value={personalInfo.address}
                  onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
                  placeholder="Enter your residential address"
                  multiline
                  numberOfLines={3}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>
            </View>
          )}

          {/* Step 1: ID Details */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>ID Details</Text>
              <Text style={styles.stepDescription}>
                Please provide details of your government-issued ID
              </Text>

              <View style={styles.formGroup}>
                <Dropdown
                  label="ID Type"
                  value={idInfo.idType}
                  options={ID_TYPES}
                  onValueChange={(value) => setIdInfo(prev => ({ ...prev, idType: value as IdType }))}
                  placeholder="Select ID type"
                  errorText={errors.idType}
                  helperText="Choose the government-issued ID you want to verify with"
                  required
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ID Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.idNumber && styles.inputError]}
                    value={idInfo.idNumber}
                    onChangeText={(text) => {
                      // Format based on ID type
                      const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setIdInfo(prev => ({ ...prev, idNumber: formatted }));
                    }}
                    placeholder={
                      idInfo.idType === 'national_id' ? 'e.g., 12345678901' :
                      idInfo.idType === 'drivers_license' ? 'e.g., ABC12345678' :
                      idInfo.idType === 'passport' ? 'e.g., A12345678' :
                      'Enter ID number'
                    }
                    autoCapitalize="characters"
                    maxLength={20}
                  />
                  {idInfo.idNumber && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setIdInfo(prev => ({ ...prev, idNumber: '' }))}
                    >
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
                {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
                {idInfo.idType && !errors.idNumber && (
                  <Text style={styles.helperText}>
                    {idInfo.idType === 'national_id' && 'Enter your 11-digit NIN'}
                    {idInfo.idType === 'drivers_license' && 'Enter your driver\'s license number'}
                    {idInfo.idType === 'passport' && 'Enter your passport number'}
                    {idInfo.idType === 'voters_card' && 'Enter your voter\'s card number'}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <DateInput
                  label="Expiry Date"
                  value={idInfo.expiryDate}
                  onDateChange={(date) => setIdInfo(prev => ({ ...prev, expiryDate: date ? format(date, 'yyyy-MM-dd') : '' }))}
                  placeholder="DD/MM/YYYY"
                  minDate={new Date()}
                  errorText={errors.expiryDate}
                  helperText="Your ID must not be expired"
                  required
                />
              </View>
            </View>
          )}

          {/* Step 2: Upload Documents */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload Documents</Text>
              <Text style={styles.stepDescription}>
                Please upload clear photos of your ID and a selfie
              </Text>

              {/* ID Document Upload */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>ID Document</Text>
                <Text style={styles.uploadHint}>Upload a clear photo of your ID</Text>

                {documents.idImage ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: documents.idImage.uri }} style={styles.previewImage} />
                    {documents.idImage.uploading && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.uploadingText}>Uploading...</Text>
                      </View>
                    )}
                    {documents.idImage.uploaded && (
                      <View style={styles.uploadedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setDocuments(prev => ({ ...prev, idImage: null }))}
                    >
                      <Ionicons name="close-circle" size={24} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('idImage')}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#0066A1" />
                    <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                  </TouchableOpacity>
                )}
                {errors.idImage && <Text style={styles.errorText}>{errors.idImage}</Text>}
              </View>

              {/* Selfie Upload */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Selfie</Text>
                <Text style={styles.uploadHint}>Take a clear selfie of yourself</Text>

                {documents.selfieImage ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: documents.selfieImage.uri }} style={styles.previewImage} />
                    {documents.selfieImage.uploading && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.uploadingText}>Uploading...</Text>
                      </View>
                    )}
                    {documents.selfieImage.uploaded && (
                      <View style={styles.uploadedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setDocuments(prev => ({ ...prev, selfieImage: null }))}
                    >
                      <Ionicons name="close-circle" size={24} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadOptions}>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto('selfieImage')}>
                      <Ionicons name="camera-outline" size={32} color="#0066A1" />
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('selfieImage')}>
                      <Ionicons name="image-outline" size={32} color="#0066A1" />
                      <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {errors.selfieImage && <Text style={styles.errorText}>{errors.selfieImage}</Text>}
              </View>
            </View>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review & Submit</Text>
              <Text style={styles.stepDescription}>
                Please review your information before submitting
              </Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Personal Information</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Name:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.firstName} {personalInfo.lastName}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Date of Birth:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.dateOfBirth}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Gender:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.gender}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Address:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.address}</Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>ID Details</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>ID Type:</Text>
                  <Text style={styles.reviewValue}>
                    {ID_TYPES.find(t => t.value === idInfo.idType)?.label}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>ID Number:</Text>
                  <Text style={styles.reviewValue}>{idInfo.idNumber}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Expiry Date:</Text>
                  <Text style={styles.reviewValue}>{idInfo.expiryDate}</Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Documents</Text>
                <View style={styles.documentThumbnails}>
                  {documents.idImage && (
                    <View style={styles.thumbnail}>
                      <Image source={{ uri: documents.idImage.uri }} style={styles.thumbnailImage} />
                      <Text style={styles.thumbnailLabel}>ID Document</Text>
                    </View>
                  )}
                  {documents.selfieImage && (
                    <View style={styles.thumbnail}>
                      <Image source={{ uri: documents.selfieImage.uri }} style={styles.thumbnailImage} />
                      <Text style={styles.thumbnailLabel}>Selfie</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.disclaimerBox}>
                <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
                <Text style={styles.disclaimerText}>
                  By submitting, you confirm that all information provided is accurate and belongs to you.
                  Providing false information may result in account suspension.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButtonNav}
              onPress={handleBack}
              disabled={submitKycMutation.isPending}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 0 && styles.fullWidthButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, submitKycMutation.isPending && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitKycMutation.isPending}
            >
              {submitKycMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </>
              ) : (
                <Text style={styles.submitButtonText}>Submit Verification</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#0066A1',
  },
  stepCircleCompleted: {
    backgroundColor: '#28A745',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#0066A1',
    fontWeight: '500',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: '#28A745',
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC3545',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    marginTop: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#0066A1',
    marginTop: 8,
    fontWeight: '500',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  uploadedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 120,
  },
  reviewValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
    fontWeight: '500',
  },
  documentThumbnails: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
  },
  thumbnailLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButtonNav: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  fullWidthButton: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#28A745',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});