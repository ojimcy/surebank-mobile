/**
 * Create Schedule Screen
 *
 * Multi-step form for creating a new scheduled contribution.
 * Steps: Package & Card → Amount & Frequency → Schedule & Review
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Clock,
  Plus,
  Calendar,
} from 'lucide-react-native';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { useCardQueries, type Card } from '@/hooks/queries/useCardQueries';
import { usePackagesQuery } from '@/hooks/queries/usePackagesQuery';
import type { UIPackage } from '@/services/api/packages';
import { CreateSchedulePayload } from '@/services/api/scheduledContributions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import NestedHeader from '@/components/navigation/NestedHeader';

const STEPS = [
  {
    id: 1,
    title: 'Package & Card',
    description: 'Select savings package and payment method',
    icon: Wallet,
  },
  {
    id: 2,
    title: 'Amount & Frequency',
    description: 'Set contribution amount and schedule',
    icon: DollarSign,
  },
  {
    id: 3,
    title: 'Schedule & Review',
    description: 'Configure dates and review details',
    icon: Clock,
  },
];

type PackageType = 'ds' | 'sb';
type Frequency = 'daily' | 'weekly' | 'monthly';

export default function CreateScheduleScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackageType, setSelectedPackageType] = useState<PackageType>('ds');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [formData, setFormData] = useState<CreateSchedulePayload>({
    packageId: '',
    contributionType: 'ds',
    storedCardId: '',
    amount: 0,
    frequency: 'monthly',
    startDate: new Date().toISOString(),
    endDate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSchedulePayload, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createScheduleAsync, isCreateScheduleLoading } = useScheduleQueries();
  const { cards, hasCards, isCardsLoading } = useCardQueries();
  const { packages, hasPackages, isLoading: isPackagesLoading } = usePackagesQuery();

  // Update form data when package type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contributionType: selectedPackageType,
      packageId: '', // Reset package selection when type changes
    }));
  }, [selectedPackageType]);

  // Filter active packages based on selected type
  const getActivePackages = () => {
    if (!packages) return [];

    if (selectedPackageType === 'ds') {
      return packages.filter(
        (pkg: any) => pkg.type === 'ds' && pkg.status === 'active'
      );
    } else {
      return packages.filter(
        (pkg: any) => pkg.type === 'sb' && pkg.current < pkg.target
      );
    }
  };

  const activePackages = getActivePackages();
  const activeCards = cards?.filter((card: Card) => card.isActive) || [];

  const handleInputChange = (field: keyof CreateSchedulePayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CreateSchedulePayload, string>> = {};

    if (step === 1) {
      if (!formData.packageId) {
        newErrors.packageId = 'Please select a package';
      }
      if (!formData.storedCardId) {
        newErrors.storedCardId = 'Please select a card';
      }
    }

    if (step === 2) {
      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (formData.amount < 100) {
        newErrors.amount = 'Minimum amount is ₦100';
      }

      // Package-specific validation for DS
      if (formData.packageId && selectedPackageType === 'ds') {
        const selectedPackage = activePackages.find((pkg: any) => pkg.id === formData.packageId);
        if (selectedPackage?.amountPerDay) {
          if (formData.amount % selectedPackage.amountPerDay !== 0) {
            newErrors.amount = `Amount must be a multiple of ₦${selectedPackage.amountPerDay.toLocaleString()}`;
          }
        }
      }
    }

    if (step === 3) {
      if (!formData.startDate) {
        newErrors.startDate = 'Please select a start date';
      }

      if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        const startDate = new Date(formData.startDate);
        if (endDate <= startDate) {
          newErrors.endDate = 'End date must be after start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceed = (step: number): boolean => {
    if (step === 1) {
      return formData.packageId !== '' && formData.storedCardId !== '';
    }
    if (step === 2) {
      return formData.amount > 0;
    }
    return true;
  };

  const getFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Every week';
      case 'monthly':
        return 'Every month';
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    if (currentStep < STEPS.length) {
      handleNext();
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        endDate: formData.endDate || undefined,
      };
      await createScheduleAsync(submitData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCardsLoading || isPackagesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0066A1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <NestedHeader title="Create Scheduled Payment" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Prerequisites Check */}
        {(!hasPackages || !hasCards) && (
          <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                {!hasPackages && !hasCards && (
                  <View>
                    <Text className="text-amber-800 font-medium mb-2">
                      Requirements Missing
                    </Text>
                    <Text className="text-amber-700 text-sm mb-3">
                      You need at least one active package and one card to create a schedule.
                    </Text>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => navigation.navigate('NewPackage' as never)}
                        className="flex-1 bg-amber-600 py-2 rounded-lg"
                      >
                        <Text className="text-white text-center text-sm">Create Package</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('AddCard' as never)}
                        className="flex-1 bg-amber-600 py-2 rounded-lg"
                      >
                        <Text className="text-white text-center text-sm">Add Card</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {!hasPackages && hasCards && (
                  <View>
                    <Text className="text-amber-800 font-medium mb-2">
                      No Active Packages
                    </Text>
                    <Text className="text-amber-700 text-sm mb-3">
                      You need at least one active package.
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('NewPackage' as never)}
                      className="bg-amber-600 py-2 px-4 rounded-lg"
                    >
                      <Text className="text-white text-sm">Create Package</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {hasPackages && !hasCards && (
                  <View>
                    <Text className="text-amber-800 font-medium mb-2">
                      No Payment Cards
                    </Text>
                    <Text className="text-amber-700 text-sm mb-3">
                      You need at least one card for payments.
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddCard' as never)}
                      className="bg-amber-600 py-2 px-4 rounded-lg flex-row items-center"
                    >
                      <Plus size={16} color="white" />
                      <Text className="text-white text-sm ml-2">Add Payment Card</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row items-start">
            <Info size={20} color="#3B82F6" />
            <Text className="ml-3 flex-1 text-blue-800 text-sm">
              Scheduled contributions automatically transfer the specified amount from your card to your savings package.
            </Text>
          </View>
        </View>

        {/* Step Progress */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const IconComponent = step.icon;

              return (
                <View key={step.id} className="flex-1 flex-row items-center">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isCompleted
                        ? 'bg-[#0066A1]'
                        : isActive
                        ? 'border-2 border-[#0066A1] bg-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} color="white" />
                    ) : (
                      <IconComponent size={20} color={isActive ? '#0066A1' : '#9CA3AF'} />
                    )}
                  </View>
                  {index < STEPS.length - 1 && (
                    <View className="flex-1 h-0.5 bg-gray-200 mx-2" />
                  )}
                </View>
              );
            })}
          </View>
          <View className="mt-2">
            <Text className="text-lg font-semibold text-gray-900">
              {STEPS[currentStep - 1].title}
            </Text>
            <Text className="text-sm text-gray-600">
              {STEPS[currentStep - 1].description}
            </Text>
          </View>
        </View>

        {/* Form Content */}
        <View className="mx-4 mt-6 bg-white rounded-xl p-4">
          {/* Step 1: Package & Card Selection */}
          {currentStep === 1 && (
            <View className="space-y-4">
              {/* Package Type Selection */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Package Type</Text>
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => setSelectedPackageType('ds')}
                    className={`flex-1 p-4 border rounded-lg ${
                      selectedPackageType === 'ds'
                        ? 'border-[#0066A1] bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className="font-medium text-gray-900">Daily Savings</Text>
                    <Text className="text-xs text-gray-600 mt-1">Fixed daily amounts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedPackageType('sb')}
                    className={`flex-1 p-4 border rounded-lg ${
                      selectedPackageType === 'sb'
                        ? 'border-[#0066A1] bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className="font-medium text-gray-900">Savings Buying</Text>
                    <Text className="text-xs text-gray-600 mt-1">Product purchase</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Package Selection */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Select Package</Text>
                {activePackages.length === 0 ? (
                  <View className="p-4 bg-gray-50 rounded-lg items-center">
                    <Text className="text-gray-600 text-sm mb-2">
                      No active {selectedPackageType === 'ds' ? 'Daily Savings' : 'SB'} packages
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('NewPackage' as never)}
                      className="text-[#0066A1]"
                    >
                      <Text className="text-[#0066A1] text-sm underline">Create one</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView className="max-h-48">
                    {activePackages.map((pkg: any) => (
                      <TouchableOpacity
                        key={pkg.id}
                        onPress={() => handleInputChange('packageId', pkg.id)}
                        className={`p-3 border rounded-lg mb-2 ${
                          formData.packageId === pkg.id
                            ? 'border-[#0066A1] bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <Wallet size={16} color={formData.packageId === pkg.id ? '#0066A1' : '#6B7280'} />
                          <View className="ml-3 flex-1">
                            <Text className="font-medium text-gray-900">{pkg.title}</Text>
                            <Text className="text-xs text-gray-600">
                              {formatCurrency(pkg.current)} / {formatCurrency(pkg.target)} ({pkg.progress}%)
                            </Text>
                            {selectedPackageType === 'ds' && pkg.amountPerDay && (
                              <Text className="text-xs text-blue-600">
                                ₦{pkg.amountPerDay.toLocaleString()}/day
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {errors.packageId && (
                  <Text className="text-red-600 text-sm mt-1">{errors.packageId}</Text>
                )}
              </View>

              {/* Card Selection */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Payment Card</Text>
                {activeCards.length === 0 ? (
                  <View className="p-4 bg-gray-50 rounded-lg items-center">
                    <Text className="text-gray-600 text-sm mb-2">No active cards</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddCard' as never)}
                      className="text-[#0066A1]"
                    >
                      <Text className="text-[#0066A1] text-sm underline">Add a card</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView className="max-h-48">
                    {activeCards.map((card: Card) => (
                      <TouchableOpacity
                        key={card._id}
                        onPress={() => handleInputChange('storedCardId', card._id)}
                        className={`p-3 border rounded-lg mb-2 ${
                          formData.storedCardId === card._id
                            ? 'border-[#0066A1] bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <CreditCard
                            size={16}
                            color={formData.storedCardId === card._id ? '#0066A1' : '#6B7280'}
                          />
                          <Text className="ml-3 text-gray-900">
                            •••• {card.lastFourDigits} ({card.bank})
                          </Text>
                          {card.isDefault && (
                            <View className="ml-auto bg-gray-200 px-2 py-1 rounded">
                              <Text className="text-xs text-gray-600">Default</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {errors.storedCardId && (
                  <Text className="text-red-600 text-sm mt-1">{errors.storedCardId}</Text>
                )}
              </View>
            </View>
          )}

          {/* Step 2: Amount & Frequency */}
          {currentStep === 2 && (
            <View className="space-y-4">
              {/* Amount */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Amount (₦)</Text>
                <TextInput
                  placeholder="1000"
                  value={formData.amount > 0 ? formData.amount.toString() : ''}
                  onChangeText={text => handleInputChange('amount', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  className={`border rounded-lg px-3 py-3 text-gray-900 ${
                    errors.amount ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.amount && (
                  <Text className="text-red-600 text-sm mt-1">{errors.amount}</Text>
                )}
                {formData.packageId && selectedPackageType === 'ds' && (() => {
                  const selectedPackage = activePackages.find((pkg: any) => pkg.id === formData.packageId);
                  if (selectedPackage?.amountPerDay) {
                    return (
                      <Text className="text-blue-600 text-xs mt-1">
                        Amount must be a multiple of ₦{selectedPackage.amountPerDay.toLocaleString()}
                      </Text>
                    );
                  }
                  return null;
                })()}
                <Text className="text-gray-500 text-xs mt-1">Minimum amount is ₦100</Text>
              </View>

              {/* Frequency */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Frequency</Text>
                <View className="space-y-2">
                  {(['daily', 'weekly', 'monthly'] as Frequency[]).map(freq => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => handleInputChange('frequency', freq)}
                      className={`p-3 border rounded-lg ${
                        formData.frequency === freq
                          ? 'border-[#0066A1] bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <Text className="text-gray-900 capitalize">{freq}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-gray-500 text-xs mt-2">
                  {getFrequencyDescription(formData.frequency)} - {formatCurrency(formData.amount)} will be transferred {formData.frequency}
                </Text>
              </View>
            </View>
          )}

          {/* Step 3: Schedule & Review */}
          {currentStep === 3 && (
            <View className="space-y-4">
              {/* Start Date */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">Start Date</Text>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  className={`border rounded-lg px-3 py-3 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="ml-2 text-gray-900">
                      {formatDate(formData.startDate)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.startDate && (
                  <Text className="text-red-600 text-sm mt-1">{errors.startDate}</Text>
                )}
              </View>

              {/* End Date */}
              <View>
                <Text className="font-medium text-gray-900 mb-3">End Date (Optional)</Text>
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  className={`border rounded-lg px-3 py-3 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="ml-2 text-gray-900">
                      {formData.endDate ? formatDate(formData.endDate) : 'No end date'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.endDate && (
                  <Text className="text-red-600 text-sm mt-1">{errors.endDate}</Text>
                )}
                <Text className="text-gray-500 text-xs mt-1">
                  Leave empty for indefinite schedule
                </Text>
              </View>

              {/* Summary */}
              {formData.amount > 0 && formData.frequency && (
                <View className="bg-gray-50 rounded-lg p-4 mt-4">
                  <Text className="font-medium text-gray-900 mb-3">Schedule Summary</Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Amount:</Text>
                      <Text className="font-medium">{formatCurrency(formData.amount)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Frequency:</Text>
                      <Text className="font-medium">{getFrequencyDescription(formData.frequency)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Start Date:</Text>
                      <Text className="font-medium">{formatDate(formData.startDate)}</Text>
                    </View>
                    {formData.endDate && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">End Date:</Text>
                        <Text className="font-medium">{formatDate(formData.endDate)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="mx-4 mt-6 mb-8 flex-row justify-between">
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              currentStep === 1 ? 'bg-gray-200' : 'bg-white border border-gray-300'
            }`}
          >
            <ChevronLeft size={20} color={currentStep === 1 ? '#9CA3AF' : '#4B5563'} />
            <Text className={`ml-2 ${currentStep === 1 ? 'text-gray-400' : 'text-gray-700'}`}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canProceed(currentStep) || isSubmitting || isCreateScheduleLoading}
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              canProceed(currentStep) && !isSubmitting && !isCreateScheduleLoading
                ? 'bg-[#0066A1]'
                : 'bg-gray-300'
            }`}
          >
            {isSubmitting || isCreateScheduleLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white ml-2">Creating...</Text>
              </>
            ) : currentStep < STEPS.length ? (
              <>
                <Text className="text-white mr-2">Next</Text>
                <ChevronRight size={20} color="white" />
              </>
            ) : (
              <>
                <CheckCircle2 size={20} color="white" />
                <Text className="text-white ml-2">Create Schedule</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(formData.startDate)}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                handleInputChange('startDate', selectedDate.toISOString());
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate ? new Date(formData.endDate) : new Date()}
            mode="date"
            display="default"
            minimumDate={new Date(formData.startDate)}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                handleInputChange('endDate', selectedDate.toISOString());
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}