/**
 * Deposit/Contribution Screen
 * Enhanced UX with improved package selection and better visual feedback
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import packagesService, { type DailySavingsPackage, type SBPackage } from '@/services/api/packages';
import type { PackageScreenProps } from '@/navigation/types';


type PackageType = 'ds' | 'sb';

interface PackageOption {
  id: string;
  name: string;
  type: string;
  balance: number;
  target?: number;
  amountPerDay?: number;
  status?: string;
  totalCount?: number;
  accountNumber?: string;
}

export default function DepositScreen({ navigation, route }: PackageScreenProps<'Deposit'>) {
  // Extract params from route
  const { accountType: initialAccountType, packageId: preselectedPackageId } = route?.params || {};

  const [selectedType, setSelectedType] = useState<PackageType>(
    initialAccountType === 'ib' ? 'ds' : (initialAccountType || 'ds')
  );
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedPackageList, setExpandedPackageList] = useState(false);
  const [showSuccessTip, setShowSuccessTip] = useState(false);

  // Animation values
  const scaleAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { user } = useAuth();

  // Enhanced validation for DS packages
  const validateDSContribution = (
    packageData: PackageOption,
    contributionAmount: number
  ): { isValid: boolean; error?: string } => {
    if (packageData.type !== 'Daily Savings' || !packageData.amountPerDay) {
      return { isValid: true };
    }

    // Check if amount is a multiple of amountPerDay
    if (contributionAmount % packageData.amountPerDay !== 0) {
      return {
        isValid: false,
        error: `Amount must be a multiple of ₦${packageData.amountPerDay.toLocaleString()} (daily amount)`
      };
    }

    // Calculate contribution days
    const contributionDays = Math.round(contributionAmount / packageData.amountPerDay);

    if (contributionDays <= 0) {
      return {
        isValid: false,
        error: 'Contribution amount is too small'
      };
    }

    // Check contribution circle limit (31 days max cycle)
    const CONTRIBUTION_CIRCLE = 31;
    const currentTotalCount = packageData.totalCount || 0;
    const newTotalCount = currentTotalCount + contributionDays;

    if (newTotalCount > CONTRIBUTION_CIRCLE) {
      const remainingDays = CONTRIBUTION_CIRCLE - currentTotalCount;
      const maxAllowedAmount = remainingDays * packageData.amountPerDay;
      return {
        isValid: false,
        error: `Max: ₦${maxAllowedAmount.toLocaleString()} (${remainingDays} days remaining in cycle)`
      };
    }

    return { isValid: true };
  };

  // Real-time validation when amount changes
  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;

    setAmount(formattedValue);
    setValidationError(null);

    if (!selectedPackage || !formattedValue) return;

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPackageData) return;

    const contributionAmount = parseFloat(formattedValue);
    if (isNaN(contributionAmount) || contributionAmount <= 0) return;

    // Validate DS contribution
    if (selectedPackageData.type === 'Daily Savings') {
      const validation = validateDSContribution(selectedPackageData, contributionAmount);
      if (!validation.isValid) {
        setValidationError(validation.error || null);
      }
    }
  };

  // Clear validation error when package selection changes
  useEffect(() => {
    setValidationError(null);
    setAmount('');
    if (amount && selectedPackage) {
      const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
      if (selectedPackageData?.type === 'Daily Savings') {
        const contributionAmount = parseFloat(amount);
        if (!isNaN(contributionAmount) && contributionAmount > 0) {
          const validation = validateDSContribution(selectedPackageData, contributionAmount);
          if (!validation.isValid) {
            setValidationError(validation.error || null);
          }
        }
      }
    }
  }, [selectedPackage]);

  // Fetch packages based on selected type
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserPackages = async () => {
      setFetchingPackages(true);
      // Only clear selection if user manually changed type (not preselected package)
      if (!preselectedPackageId) {
        setSelectedPackage(null);
      }
      setAmount('');
      try {
        let fetchedPackages: PackageOption[] = [];

        switch (selectedType) {
          case 'ds':
            const dsPackages = await packagesService.getDailySavings(user.id);
            // Filter out closed packages
            const activeDS = dsPackages.filter(pkg => pkg.status !== 'closed');
            fetchedPackages = activeDS.map((pkg: DailySavingsPackage) => ({
              id: pkg.id,
              name: pkg.target || 'Daily Savings',
              type: 'Daily Savings',
              balance: pkg.totalContribution,
              target: pkg.targetAmount,
              amountPerDay: pkg.amountPerDay,
              status: pkg.status,
              totalCount: pkg.totalCount || 0,
              accountNumber: pkg.accountNumber,
            }));
            break;
          case 'sb':
            const sbPackages = await packagesService.getSBPackages(user.id);
            // Filter out closed packages
            const activeSB = sbPackages.filter(pkg => pkg.status !== 'closed');
            fetchedPackages = activeSB.map((pkg: SBPackage) => ({
              id: pkg._id,
              name: pkg.product?.name || 'SB Package',
              type: 'SB Package',
              balance: pkg.totalContribution,
              target: pkg.targetAmount,
              status: pkg.status,
              accountNumber: pkg.accountNumber,
            }));
            break;
        }

        setPackages(fetchedPackages);

        // Auto-select package based on priority:
        // 1. If packageId is provided in route params and exists in fetched packages
        // 2. If only one package is available
        if (preselectedPackageId && fetchedPackages.some(pkg => pkg.id === preselectedPackageId)) {
          setSelectedPackage(preselectedPackageId);
        } else if (fetchedPackages.length === 1) {
          setSelectedPackage(fetchedPackages[0].id);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        Alert.alert('Error', 'Failed to fetch packages. Please try again.');
      } finally {
        setFetchingPackages(false);
      }
    };

    fetchUserPackages();
  }, [selectedType, user?.id, preselectedPackageId]);

  const handleSubmit = async () => {
    if (!selectedPackage || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please select a package and enter a valid amount.');
      return;
    }

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPackageData) {
      Alert.alert('Error', 'Package information not found.');
      return;
    }

    const contributionAmount = parseFloat(amount);

    // Enhanced validation for DS contribution
    if (selectedPackageData.type === 'Daily Savings') {
      const validation = validateDSContribution(selectedPackageData, contributionAmount);
      if (!validation.isValid) {
        Alert.alert('Invalid Amount', validation.error || 'Invalid contribution amount');
        return;
      }
    }

    setLoading(true);
    try {
      // Initialize payment through Paystack
      const paymentData = {
        packageId: selectedPackage,
        amount: contributionAmount,
        contributionType: selectedType === 'ds' ? 'daily_savings' as const : 'savings_buying' as const,
      };

      const response = await packagesService.initializeContribution(paymentData);
      const authorizationUrl = response.authorization_url || response.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error('No authorization URL received from payment initialization');
      }

      // Open the payment URL in browser or in-app browser
      const supported = await Linking.canOpenURL(authorizationUrl);
      if (supported) {
        await Linking.openURL(authorizationUrl);

        // Show success message with updated instructions
        Alert.alert(
          'Payment Initiated',
          'Complete your payment securely with Paystack. You will be redirected back to the app automatically after payment.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error('Cannot open payment URL');
      }
    } catch (error: any) {
      console.error('Failed to initialize contribution:', error);

      let errorMessage = 'Failed to process your contribution. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const presetAmounts = useMemo(() => {
    if (!selectedPackage) {
      return [1000, 5000, 10000];
    }

    const selectedPkg = packages.find(p => p.id === selectedPackage);

    if (selectedPkg?.type === 'Daily Savings' && selectedPkg.amountPerDay) {
      // For DS packages, use multiples of daily amount
      const baseAmount = selectedPkg.amountPerDay;
      return [baseAmount, baseAmount * 7, baseAmount * 30];
    }

    return [1000, 5000, 10000];
  }, [selectedPackage, packages]);

  const getPresetLabel = (preset: number) => {
    const selectedPkg = packages.find(p => p.id === selectedPackage);
    if (selectedPkg?.type === 'Daily Savings' && selectedPkg.amountPerDay) {
      const days = preset / selectedPkg.amountPerDay;
      if (days === 1) return '1 day';
      if (days === 7) return '1 week';
      if (days === 30) return '1 month';
      return `${days} days`;
    }
    return null;
  };

  // Show success tip when package is selected
  useEffect(() => {
    if (selectedPackage && packages.length > 0) {
      setShowSuccessTip(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSuccessTip(false));
    }
  }, [selectedPackage]);

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Package Type Selector */}
          <View style={styles.typeSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Package Type</Text>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 1 of 3</Text>
              </View>
            </View>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedType('ds');
                  animatePress();
                }}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.typeCard,
                    selectedType === 'ds' && styles.typeCardActive,
                    { transform: [{ scale: selectedType === 'ds' ? scaleAnim : 1 }] }
                  ]}
                >
                  <LinearGradient
                    colors={selectedType === 'ds' ? ['#0066A1', '#0077B5'] : ['#f9fafb', '#f9fafb']}
                    style={styles.typeGradient}
                  >
                    <Ionicons
                      name="wallet"
                      size={28}
                      color={selectedType === 'ds' ? '#ffffff' : '#6b7280'}
                    />
                    <Text style={[
                      styles.typeTitle,
                      selectedType === 'ds' && styles.typeTitleActive
                    ]}>
                      Daily Savings
                    </Text>
                    <Text style={[
                      styles.typeDescription,
                      selectedType === 'ds' && styles.typeDescriptionActive
                    ]}>
                      Regular contributions
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedType('sb');
                  animatePress();
                }}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.typeCard,
                    selectedType === 'sb' && styles.typeCardActiveSB,
                    { transform: [{ scale: selectedType === 'sb' ? scaleAnim : 1 }] }
                  ]}
                >
                  <LinearGradient
                    colors={selectedType === 'sb' ? ['#7952B3', '#8B5CF6'] : ['#f9fafb', '#f9fafb']}
                    style={styles.typeGradient}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={28}
                      color={selectedType === 'sb' ? '#ffffff' : '#6b7280'}
                    />
                    <Text style={[
                      styles.typeTitle,
                      selectedType === 'sb' && styles.typeTitleActive
                    ]}>
                      SB Package
                    </Text>
                    <Text style={[
                      styles.typeDescription,
                      selectedType === 'sb' && styles.typeDescriptionActive
                    ]}>
                      Product savings
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Package Selector - Enhanced */}
          <View style={styles.packageSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Select Package</Text>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepText}>Step 2 of 3</Text>
                </View>
              </View>
              {packages.length > 3 && (
                <TouchableOpacity
                  onPress={() => setExpandedPackageList(!expandedPackageList)}
                  style={styles.expandButton}
                >
                  <Text style={styles.expandButtonText}>
                    {expandedPackageList ? 'Show Less' : `View All (${packages.length})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {fetchingPackages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066A1" />
                <Text style={styles.loadingText}>Loading packages...</Text>
              </View>
            ) : packages.length > 0 ? (
              <View style={[
                styles.packageList,
                expandedPackageList && styles.packageListExpanded
              ]}>
                {packages.slice(0, expandedPackageList ? undefined : 3).map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    onPress={() => setSelectedPackage(pkg.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.packageCard,
                      selectedPackage === pkg.id && styles.packageCardActive
                    ]}>
                      <View style={styles.packageCardContent}>
                        <View style={[
                          styles.packageIcon,
                          selectedPackage === pkg.id && styles.packageIconActive
                        ]}>
                          <Ionicons
                            name={selectedType === 'ds' ? 'wallet' : 'cube-outline'}
                            size={20}
                            color={selectedPackage === pkg.id ? '#ffffff' : '#6b7280'}
                          />
                        </View>
                        <View style={styles.packageDetails}>
                          <Text style={[
                            styles.packageName,
                            selectedPackage === pkg.id && styles.packageNameActive
                          ]}>
                            {pkg.name}
                          </Text>
                          <Text style={styles.packageMeta}>
                            {pkg.accountNumber} • {formatCurrency(pkg.balance)}
                          </Text>
                          {pkg.type === 'Daily Savings' && pkg.amountPerDay && (
                            <View style={styles.packageBadge}>
                              <Text style={styles.packageBadgeText}>
                                ₦{pkg.amountPerDay}/day
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {selectedPackage === pkg.id && (
                        <View style={styles.checkIcon}>
                          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name={selectedType === 'ds' ? 'wallet-outline' : 'cube-outline'}
                  size={48}
                  color="#9ca3af"
                />
                <Text style={styles.emptyStateText}>
                  No {selectedType === 'ds' ? 'Daily Savings' : 'SB'} packages found
                </Text>
                <TouchableOpacity
                  style={styles.createPackageButton}
                  onPress={() => navigation.navigate(selectedType === 'ds' ? 'CreateDailySavings' : 'CreateSBPackage')}
                >
                  <Text style={styles.createPackageButtonText}>Create New Package</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Amount Input - Enhanced */}
          <View style={styles.amountSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 3 of 3</Text>
              </View>
            </View>
            <View style={[
              styles.amountInputContainer,
              validationError && styles.amountInputError
            ]}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                editable={!!selectedPackage}
              />
            </View>
            {validationError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            )}

            {/* Success tip animation */}
            {showSuccessTip && selectedPackage && (
              <Animated.View
                style={[
                  styles.successTip,
                  { opacity: fadeAnim }
                ]}
              >
                <Ionicons name="information-circle" size={16} color="#0066A1" />
                <Text style={styles.successTipText}>
                  {packages.find(p => p.id === selectedPackage)?.type === 'Daily Savings'
                    ? 'Tip: Use multiples of daily amount for easy tracking'
                    : 'Enter any amount you wish to contribute'}
                </Text>
              </Animated.View>
            )}

            {/* Smart Preset Amounts */}
            <View style={styles.presetContainer}>
              {presetAmounts.map((preset, index) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleAmountChange(preset.toString())}
                  style={[
                    styles.presetButton,
                    !selectedPackage && styles.presetButtonDisabled,
                    amount === preset.toString() && styles.presetButtonActive
                  ]}
                  disabled={!selectedPackage}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.presetAmount,
                    !selectedPackage && styles.presetAmountDisabled,
                    amount === preset.toString() && styles.presetAmountActive
                  ]}>
                    ₦{preset.toLocaleString()}
                  </Text>
                  {getPresetLabel(preset) && (
                    <Text style={[
                      styles.presetLabel,
                      !selectedPackage && styles.presetLabelDisabled,
                      amount === preset.toString() && styles.presetLabelActive
                    ]}>
                      {getPresetLabel(preset)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary Section */}
          {selectedPackage && amount && parseFloat(amount) > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Contribution Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Package</Text>
                  <Text style={styles.summaryValue}>
                    {packages.find(p => p.id === selectedPackage)?.name}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={styles.summaryAmount}>
                    {formatCurrency(parseFloat(amount))}
                  </Text>
                </View>
                {packages.find(p => p.id === selectedPackage)?.type === 'Daily Savings' &&
                 packages.find(p => p.id === selectedPackage)?.amountPerDay && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Days Covered</Text>
                      <Text style={styles.summaryValue}>
                        {Math.round(parseFloat(amount) / (packages.find(p => p.id === selectedPackage)?.amountPerDay || 1))} days
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentIconContainer}>
                <LinearGradient
                  colors={['#00C851', '#00A846']}
                  style={styles.paymentIconGradient}
                >
                  <Ionicons name="card" size={20} color="#ffffff" />
                </LinearGradient>
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Paystack</Text>
                <Text style={styles.paymentDescription}>Secure payment gateway</Text>
              </View>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            </View>
          </View>

          {/* Proceed Button */}
          <View >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedPackage || !amount || loading || !!validationError}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !selectedPackage || !amount || loading || !!validationError
                    ? ['#e5e7eb', '#e5e7eb']
                    : ['#0066A1', '#0077B5']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      Proceed to Payment
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  typeSection: {
    marginBottom: 28,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stepIndicator: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0066A1',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  typeCardActive: {
    borderColor: '#0066A1',
    ...Platform.select({
      ios: {
        shadowColor: '#0066A1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  typeCardActiveSB: {
    borderColor: '#7952B3',
    ...Platform.select({
      ios: {
        shadowColor: '#7952B3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  typeGradient: {
    padding: 16,
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  typeTitleActive: {
    color: '#ffffff',
  },
  typeDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  typeDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  packageSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  expandButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#0066A1',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  packageList: {
  },
  packageListExpanded: {
    maxHeight: undefined,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  packageCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#0066A1',
    ...Platform.select({
      ios: {
        shadowColor: '#0066A1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  packageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  packageIconActive: {
    backgroundColor: '#0066A1',
  },
  packageDetails: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  packageNameActive: {
    color: '#0066A1',
  },
  packageMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  packageBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  packageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  checkIcon: {
    marginLeft: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
  },
  createPackageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  createPackageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  amountSection: {
    marginBottom: 28,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 64,
  },
  amountInputError: {
    borderColor: '#ef4444',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 16,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#dc2626',
    flex: 1,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  presetButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 60,
    justifyContent: 'center',
  },
  presetButtonDisabled: {
    opacity: 0.5,
  },
  presetButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#0066A1',
  },
  presetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  presetAmountDisabled: {
    color: '#9ca3af',
  },
  presetAmountActive: {
    color: '#0066A1',
  },
  presetLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  presetLabelDisabled: {
    color: '#9ca3af',
  },
  presetLabelActive: {
    color: '#0066A1',
  },
  successTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  successTipText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#0066A1',
    flex: 1,
  },
  summarySection: {
    marginBottom: 28,
  },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  paymentSection: {
    marginBottom: 28,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentIconContainer: {
    marginRight: 12,
  },
  paymentIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  bottomContainer: {
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});