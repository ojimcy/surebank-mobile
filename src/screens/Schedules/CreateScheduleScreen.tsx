/**
 * Create Schedule Screen
 *
 * Multi-step form for creating a new scheduled contribution.
 * Steps: Package & Card → Amount & Frequency → Schedule & Review
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard,
  CheckCircle2,
  Info,
  ChevronLeft,
  DollarSign,
  Plus,
  Calendar,
  Package,
  ShoppingBag,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Repeat,
} from 'lucide-react-native';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { useCardQueries, type Card } from '@/hooks/queries/useCardQueries';
import { usePackagesQuery } from '@/hooks/queries/usePackagesQuery';
import type { SavingsPackage } from '@/components/dashboard/types';
import { CreateSchedulePayload } from '@/services/api/scheduledContributions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

const STEPS = [
  {
    id: 1,
    title: 'Choose Package',
    subtitle: 'Select your savings goal',
    icon: Package,
    color: '#0066A1',
    gradient: ['#0066A1', '#004d7a'],
  },
  {
    id: 2,
    title: 'Set Amount',
    subtitle: 'Define your contribution',
    icon: DollarSign,
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
  },
  {
    id: 3,
    title: 'Review & Confirm',
    subtitle: 'Finalize your schedule',
    icon: CheckCircle2,
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
];

const PACKAGE_TYPES = [
  {
    id: 'ds',
    title: 'Daily Savings',
    subtitle: 'Fixed daily amounts',
    icon: Calendar,
    color: '#0066A1',
    gradient: ['#0066A1', '#004d7a'],
    description: 'Automate your daily savings with fixed amounts',
  },
  {
    id: 'sb',
    title: 'Savings Buying',
    subtitle: 'Product purchase goals',
    icon: ShoppingBag,
    color: '#7952B3',
    gradient: ['#7952B3', '#6741a5'],
    description: 'Save towards specific product purchases',
  },
];

const FREQUENCIES = [
  {
    id: 'daily',
    label: 'Daily',
    icon: Zap,
    description: 'Every day',
    recommended: false,
  },
  {
    id: 'weekly',
    label: 'Weekly',
    icon: Calendar,
    description: 'Once a week',
    recommended: false,
  },
  {
    id: 'monthly',
    label: 'Monthly',
    icon: Repeat,
    description: 'Once a month',
    recommended: true,
  },
];

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

type PackageType = 'ds' | 'sb';
type Frequency = 'daily' | 'weekly' | 'monthly';

export default function CreateScheduleScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackageType, setSelectedPackageType] = useState<PackageType>('ds');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [amountInput, setAmountInput] = useState('');
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
  console.log('packages list in create schedule screen', packages);

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update form data when package type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contributionType: selectedPackageType,
      packageId: '', // Reset package selection when type changes
    }));
  }, [selectedPackageType]);

  // Filter packages based on selected type
  const getActivePackages = () => {
    // Add defensive checks
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return [];
    }

    // Filter by selected type (packages are already filtered for active status in the hook)
    return packages.filter((pkg: SavingsPackage) => {
      // Ensure pkg has required properties
      if (!pkg || !pkg.type || !pkg.id) {
        return false;
      }

      // Match selected package type (case-insensitive and explicit)
      const pkgType = String(pkg.type).toLowerCase();
      const selectedType = String(selectedPackageType).toLowerCase();

      // Only return DS and SB packages (IBS packages are not supported for scheduled contributions)
      if (selectedType === 'ds') {
        return pkgType === 'ds';
      }
      if (selectedType === 'sb') {
        return pkgType === 'sb';
      }

      return false;
    });
  };

  const activePackages = getActivePackages();

  // Debug: Log packages info
  useEffect(() => {
    console.log('[CreateSchedule] Package State:', {
      isLoading: isPackagesLoading,
      hasPackages,
      totalPackages: packages?.length || 0,
      selectedType: selectedPackageType,
      filteredCount: activePackages.length,
    });

    if (packages && packages.length > 0) {
      console.log('[CreateSchedule] Available packages:', packages.map(p => ({
        id: p.id,
        type: p.type,
        status: p.status,
        title: p.title
      })));
      console.log('[CreateSchedule] Filtered packages for type', selectedPackageType, ':',
        activePackages.map(p => ({ id: p.id, title: p.title, type: p.type }))
      );
    }
  }, [packages, selectedPackageType, activePackages, isPackagesLoading, hasPackages]);

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CreateSchedulePayload, string>> = {};

    switch (step) {
      case 1:
        if (!formData.packageId) {
          newErrors.packageId = 'Please select a package';
        }
        if (!formData.storedCardId) {
          newErrors.storedCardId = 'Please select a payment card';
        }
        break;
      case 2:
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'Please enter a valid amount';
        }
        if (!formData.frequency) {
          newErrors.frequency = 'Please select a frequency';
        }
        break;
      case 3:
        if (!formData.startDate) {
          newErrors.startDate = 'Please select a start date';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      animateStepTransition(() => {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      });
    }
  };

  const handlePreviousStep = () => {
    animateStepTransition(() => {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    });
  };

  const animateStepTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 200);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      await createScheduleAsync(formData);
      Toast.show({
        type: 'success',
        text1: '🎉 Schedule Created!',
        text2: 'Your automated savings plan is now active',
        position: 'top',
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Creation Failed',
        error?.response?.data?.message || 'Failed to create schedule. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render progress bar
  const renderProgressBar = () => (
    <View className="px-6 mb-6">
      <View className="flex-row justify-between mb-4">
        {STEPS.map((step, index) => (
          <View key={step.id} className="flex-1 items-center">
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                currentStep > step.id
                  ? 'bg-green-500'
                  : currentStep === step.id
                  ? 'bg-primary-600'
                  : 'bg-gray-200'
              }`}
            >
              {currentStep > step.id ? (
                <Check size={20} color="white" />
              ) : (
                <Text
                  className={`font-bold ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step.id}
                </Text>
              )}
            </View>
            <Text
              className={`text-xs text-center ${
                currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
      <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-600 rounded-full"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </View>
    </View>
  );

  // Render Step 1: Package & Card Selection
  const renderStep1 = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View className="px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Savings Path
          </Text>
          <Text className="text-gray-600">
            Select a package type and payment method for automated savings
          </Text>
        </View>

        {/* Package Type Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Package Type</Text>
          <View className="space-y-3">
            {PACKAGE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedPackageType(type.id as PackageType)}
                className="overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={selectedPackageType === type.id ? type.gradient : ['#f9fafb', '#f3f4f6'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4"
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-14 h-14 rounded-xl items-center justify-center ${
                        selectedPackageType === type.id ? 'bg-white/20' : 'bg-white'
                      }`}
                    >
                      <type.icon
                        size={24}
                        color={selectedPackageType === type.id ? 'white' : type.color}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text
                        className={`text-lg font-semibold ${
                          selectedPackageType === type.id ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {type.title}
                      </Text>
                      <Text
                        className={`text-sm ${
                          selectedPackageType === type.id ? 'text-white/80' : 'text-gray-600'
                        }`}
                      >
                        {type.description}
                      </Text>
                    </View>
                    {selectedPackageType === type.id && (
                      <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                        <Check size={16} color="white" />
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Package Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Select Package</Text>
          {isPackagesLoading ? (
            <ActivityIndicator size="small" color="#0066A1" />
          ) : activePackages.length === 0 ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('NewPackage' as never)}
              className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6 items-center"
            >
              <Plus size={32} color="#0066A1" />
              <Text className="text-primary-600 font-semibold mt-2">Create Package First</Text>
              <Text className="text-gray-600 text-sm text-center mt-1">
                You need an active package to schedule contributions
              </Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {activePackages.map((pkg: SavingsPackage) => (
                <TouchableOpacity
                  key={pkg.id}
                  onPress={() => setFormData({ ...formData, packageId: pkg.id })}
                  className={`mr-3 p-4 rounded-xl border-2 ${
                    formData.packageId === pkg.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ width: 160 }}
                >
                  <View className="items-center">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                        formData.packageId === pkg.id ? 'bg-primary-600' : 'bg-gray-100'
                      }`}
                    >
                      {pkg.type === 'ds' ? (
                        <Calendar size={20} color={formData.packageId === pkg.id ? 'white' : '#6b7280'} />
                      ) : (
                        <ShoppingBag size={20} color={formData.packageId === pkg.id ? 'white' : '#6b7280'} />
                      )}
                    </View>
                    <Text className="text-sm font-semibold text-gray-900 text-center" numberOfLines={1}>
                      {pkg.title}
                    </Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      {formatCurrency(pkg.current)}
                    </Text>
                    <View className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <View
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${pkg.progress}%` }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {errors.packageId && (
            <Text className="text-red-500 text-xs mt-2">{errors.packageId}</Text>
          )}
        </View>

        {/* Payment Card Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Payment Card</Text>
          {isCardsLoading ? (
            <ActivityIndicator size="small" color="#0066A1" />
          ) : !hasCards ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCard' as never)}
              className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-6 items-center"
            >
              <CreditCard size={32} color="#f59e0b" />
              <Text className="text-yellow-700 font-semibold mt-2">Add Payment Card</Text>
              <Text className="text-gray-600 text-sm text-center mt-1">
                Link a card for automated payments
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="space-y-3">
              {cards.map((card: Card) => (
                <TouchableOpacity
                  key={card._id}
                  onPress={() => setFormData({ ...formData, storedCardId: card._id })}
                  className={`p-4 rounded-xl border-2 ${
                    formData.storedCardId === card._id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-12 h-12 rounded-xl items-center justify-center ${
                        formData.storedCardId === card._id ? 'bg-primary-600' : 'bg-gray-100'
                      }`}
                    >
                      <CreditCard
                        size={20}
                        color={formData.storedCardId === card._id ? 'white' : '#6b7280'}
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="font-semibold text-gray-900">•••• {card.lastFourDigits}</Text>
                        {card.isDefault && (
                          <View className="ml-2 px-2 py-0.5 bg-blue-100 rounded">
                            <Text className="text-xs text-blue-700">Default</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-gray-600">{card.bank}</Text>
                    </View>
                    {formData.storedCardId === card._id && (
                      <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                        <Check size={14} color="white" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.storedCardId && (
            <Text className="text-red-500 text-xs mt-2">{errors.storedCardId}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );

  // Render Step 2: Amount & Frequency
  const renderStep2 = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View className="px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Set Your Contribution
          </Text>
          <Text className="text-gray-600">
            Choose how much and how often to save
          </Text>
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Contribution Amount</Text>
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-gray-400 mr-2">₦</Text>
              <TextInput
                className="flex-1 text-3xl font-bold text-gray-900"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={amountInput}
                onChangeText={(text) => {
                  setAmountInput(text);
                  setFormData({ ...formData, amount: parseFloat(text) || 0 });
                }}
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row flex-wrap -mx-1">
            {QUICK_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => {
                  setAmountInput(amount.toString());
                  setFormData({ ...formData, amount });
                }}
                className={`m-1 px-4 py-2 rounded-xl ${
                  formData.amount === amount
                    ? 'bg-primary-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    formData.amount === amount ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.amount && (
            <Text className="text-red-500 text-xs mt-2">{errors.amount}</Text>
          )}
        </View>

        {/* Frequency Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Payment Frequency</Text>
          <View className="space-y-3">
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.id}
                onPress={() => setFormData({ ...formData, frequency: freq.id as Frequency })}
                className={`p-4 rounded-xl border-2 ${
                  formData.frequency === freq.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      formData.frequency === freq.id ? 'bg-primary-600' : 'bg-gray-100'
                    }`}
                  >
                    <freq.icon
                      size={20}
                      color={formData.frequency === freq.id ? 'white' : '#6b7280'}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="font-semibold text-gray-900">{freq.label}</Text>
                      {freq.recommended && (
                        <View className="ml-2 px-2 py-0.5 bg-green-100 rounded">
                          <Text className="text-xs text-green-700">Recommended</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-600">{freq.description}</Text>
                  </View>
                  {formData.frequency === freq.id && (
                    <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                      <Check size={14} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {errors.frequency && (
            <Text className="text-red-500 text-xs mt-2">{errors.frequency}</Text>
          )}
        </View>

        {/* Summary Card */}
        <View className="bg-blue-50 rounded-xl p-4 flex-row items-center">
          <Info size={20} color="#0066A1" />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-medium text-blue-900">
              You'll save {formatCurrency(formData.amount)} {formData.frequency}
            </Text>
            <Text className="text-xs text-blue-700 mt-1">
              That's {formatCurrency(
                formData.frequency === 'daily' ? formData.amount * 30 :
                formData.frequency === 'weekly' ? formData.amount * 4 :
                formData.amount
              )} per month
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // Render Step 3: Schedule & Review
  const renderStep3 = () => {
    const selectedPackage = packages?.find(pkg => pkg.id === formData.packageId);
    const selectedCard = cards?.find(card => card._id === formData.storedCardId);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <View className="px-6">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Review & Confirm
            </Text>
            <Text className="text-gray-600">
              Double-check your automated savings plan
            </Text>
          </View>

          {/* Schedule Dates */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Schedule Dates</Text>

            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-700">Start Date</Text>
                </View>
                <Text className="font-medium text-gray-900">
                  {formatDate(new Date(formData.startDate))}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-700">End Date (Optional)</Text>
                </View>
                <Text className="font-medium text-gray-900">
                  {formData.endDate ? formatDate(new Date(formData.endDate)) : 'No end date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Review Summary */}
          <View className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-5 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Summary</Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Package</Text>
                <Text className="font-medium text-gray-900">{selectedPackage?.title || 'N/A'}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Amount</Text>
                <Text className="font-bold text-primary-600 text-lg">
                  {formatCurrency(formData.amount)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Frequency</Text>
                <Text className="font-medium text-gray-900 capitalize">{formData.frequency}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Card</Text>
                <Text className="font-medium text-gray-900">
                  •••• {selectedCard?.lastFourDigits || 'N/A'}
                </Text>
              </View>

              <View className="border-t border-gray-200 pt-3 mt-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Monthly Estimate</Text>
                  <Text className="font-bold text-gray-900 text-lg">
                    {formatCurrency(
                      formData.frequency === 'daily' ? formData.amount * 30 :
                      formData.frequency === 'weekly' ? formData.amount * 4 :
                      formData.amount
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Security Note */}
          <View className="bg-green-50 rounded-xl p-4 flex-row items-start mb-6">
            <Shield size={20} color="#16a34a" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-green-900">Secure & Protected</Text>
              <Text className="text-xs text-green-700 mt-1">
                Your payment information is encrypted and secure. You can pause or cancel anytime.
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {renderProgressBar()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <View className="flex-row items-center">
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handlePreviousStep}
                className="mr-3 px-4 py-3 rounded-xl bg-gray-100"
              >
                <ChevronLeft size={20} color="#6b7280" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={currentStep === 3 ? handleSubmit : handleNextStep}
              disabled={isSubmitting || isCreateScheduleLoading}
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
                isSubmitting || isCreateScheduleLoading
                  ? 'bg-gray-300'
                  : currentStep === 3
                  ? 'bg-green-600'
                  : 'bg-primary-600'
              }`}
            >
              {isSubmitting || isCreateScheduleLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">
                    {currentStep === 3 ? 'Create Schedule' : 'Continue'}
                  </Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={new Date(formData.startDate)}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setFormData({ ...formData, startDate: selectedDate.toISOString() });
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate ? new Date(formData.endDate) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setFormData({ ...formData, endDate: selectedDate.toISOString() });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}