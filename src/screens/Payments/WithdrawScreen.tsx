/**
 * Withdraw Screen
 *
 * Enhanced multi-account withdrawal flow with improved UI/UX
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Pressable,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import paymentsApi, {
  type AccountWithBalance,
  type Bank,
  type MultiWithdrawalResponse,
  type SavedBankAccount,
} from '@/services/api/payments';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Withdraw'>;

interface SelectedAccountWithdrawal {
  accountId: string;
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  amount: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function WithdrawScreen({ navigation }: Props) {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccountWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<MultiWithdrawalResponse | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankAccountName, setBankAccountName] = useState<string>('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Select accounts, 2: Enter amounts, 3: Choose bank

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Add debounce timer ref
  const verifyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total withdrawal amount
  const totalWithdrawalAmount = selectedAccounts.reduce((total, account) => {
    const amount = parseFloat(account.amount || '0');
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Progress calculation
  const progress = currentStep / 3;

  // Filtered banks based on search
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  // Start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Validate withdrawal amounts for all selected accounts
  const validateWithdrawals = (): boolean => {
    if (selectedAccounts.length === 0) return false;

    return selectedAccounts.every((selectedAccount) => {
      const amount = parseFloat(selectedAccount.amount || '0');
      return !isNaN(amount) && amount > 0 && amount <= selectedAccount.availableBalance;
    });
  };

  // Fetch user accounts with balances
  const fetchUserAccounts = useCallback(async () => {
    setFetchingAccounts(true);
    try {
      const userAccounts = await paymentsApi.getUserAccountsWithBalances();
      const activeAccounts = userAccounts.filter(
        (account: AccountWithBalance) =>
          account.status === 'active' && account.availableBalance > 0
      );
      setAccounts(activeAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to fetch accounts. Please try again.');
    } finally {
      setFetchingAccounts(false);
    }
  }, []);

  // Fetch banks
  const fetchBanks = useCallback(async () => {
    try {
      const banksList = await paymentsApi.getBanks();
      setBanks(banksList);
    } catch (error) {
      console.error('Error fetching banks:', error);
      Alert.alert('Error', 'Failed to fetch banks. Please try again.');
    }
  }, []);

  // Load saved accounts from AsyncStorage
  const loadSavedAccounts = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);
      const savedAccountsData = await AsyncStorage.getItem(`savedBankAccounts_${user.id}`);
      if (savedAccountsData) {
        const accounts = JSON.parse(savedAccountsData);
        setSavedAccounts(accounts);
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    }
  }, []);

  // Save accounts to AsyncStorage
  const saveBankAccountsToStorage = async (accounts: SavedBankAccount[]) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);
      await AsyncStorage.setItem(`savedBankAccounts_${user.id}`, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error saving accounts:', error);
    }
  };

  // Select a saved account to use
  const selectSavedAccount = (account: SavedBankAccount) => {
    setVerificationError(null);

    if (verifyTimerRef.current) {
      clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }

    setSelectedBank(account.bankCode);
    setBankAccountNumber(account.accountNumber);
    setBankAccountName(account.accountName);
    setAccountVerified(true);
    setShowBankSelector(false);

    // Update lastUsed timestamp
    const updatedAccounts = savedAccounts.map((acc) =>
      acc.id === account.id ? { ...acc, lastUsed: new Date().toISOString() } : acc
    );

    setSavedAccounts(updatedAccounts);
    saveBankAccountsToStorage(updatedAccounts);
  };

  // Verify bank account
  const verifyBankAccount = useCallback(async () => {
    if (!selectedBank || !bankAccountNumber || bankAccountNumber.length !== 10 || verifyingAccount)
      return;

    setVerifyingAccount(true);
    setAccountVerified(false);
    setVerificationError(null);

    try {
      const bankCode = banks.find((bank) => bank.code === selectedBank)?.code;
      if (!bankCode) {
        setVerificationError('Invalid bank selected');
        setVerifyingAccount(false);
        return;
      }

      const accountDetails = await paymentsApi.verifyBankAccount(bankCode, bankAccountNumber);
      setBankAccountName(accountDetails.accountName);
      setAccountVerified(true);
    } catch (error) {
      console.error('Error verifying account:', error);
      setVerificationError('Failed to verify account. Please check the details and try again.');
      setBankAccountName('');
    } finally {
      setVerifyingAccount(false);
    }
  }, [selectedBank, bankAccountNumber, banks, verifyingAccount]);

  // Toggle account selection
  const toggleAccountSelection = (account: AccountWithBalance) => {
    const isSelected = selectedAccounts.some((selected) => selected.accountId === account._id);

    if (isSelected) {
      setSelectedAccounts((prev) => prev.filter((acc) => acc.accountId !== account._id));
    } else {
      setSelectedAccounts((prev) => [
        ...prev,
        {
          accountId: account._id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          availableBalance: account.availableBalance,
          amount: '',
        },
      ]);
    }
  };

  // Update withdrawal amount for a selected account
  const updateAccountAmount = (accountId: string, amount: string) => {
    // Only allow numeric input
    const numericAmount = amount.replace(/[^0-9.]/g, '');

    setSelectedAccounts((prev) =>
      prev.map((account) => (account.accountId === accountId ? { ...account, amount: numericAmount } : account))
    );
  };

  // Set maximum amount for an account
  const setMaxAmount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.map((account) =>
        account.accountId === accountId
          ? { ...account, amount: account.availableBalance.toString() }
          : account
      )
    );
  };

  // Handle bank account number change
  const handleBankAccountNumberChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      if (numericValue !== bankAccountNumber) {
        setAccountVerified(false);
        setBankAccountName('');
        setVerificationError(null);
      }
      setBankAccountNumber(numericValue);
    }
  };

  // Process withdrawal
  const processWithdrawal = async () => {
    if (!selectedBank || !bankAccountNumber || !bankAccountName || !accountVerified) {
      setVerificationError('Please complete all bank details before proceeding');
      return;
    }

    if (!validateWithdrawals()) {
      setVerificationError('Please check withdrawal amounts for all selected accounts');
      return;
    }

    setLoading(true);

    try {
      const bankCode = banks.find((bank) => bank.code === selectedBank)?.code;
      const bankName = banks.find((bank) => bank.code === selectedBank)?.name;

      if (!bankCode || !bankName) {
        setVerificationError('Invalid bank selected');
        setLoading(false);
        return;
      }

      const withdrawalAccounts = selectedAccounts.map((account) => ({
        accountNumber: account.accountNumber,
        amount: parseFloat(account.amount),
      }));

      console.log('[WithdrawScreen] Submitting withdrawal request:', {
        withdrawalAccounts,
        bankName,
        bankCode,
        bankAccountNumber,
        bankAccountName,
      });

      const result = await paymentsApi.createMultiAccountWithdrawalRequest({
        withdrawalAccounts,
        bankName,
        bankCode,
        bankAccountNumber,
        bankAccountName,
        reason: 'Multi-account withdrawal',
      });

      console.log('[WithdrawScreen] Withdrawal success:', result);
      setWithdrawalResult(result);
      setWithdrawalSuccess(true);
    } catch (error: any) {
      console.error('[WithdrawScreen] Error processing withdrawal:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response,
      });

      // Show more specific error message
      const errorMessage =
        error.response?.message ||
        error.message ||
        'Failed to process withdrawal. Please try again.';

      Alert.alert('Withdrawal Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchUserAccounts();
    fetchBanks();
    loadSavedAccounts();
  }, []);

  // Auto-verify bank account
  useEffect(() => {
    if (verifyTimerRef.current) {
      clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }

    if (selectedBank && bankAccountNumber.length === 10 && !verifyingAccount && !accountVerified) {
      verifyTimerRef.current = setTimeout(() => {
        verifyBankAccount();
      }, 500);
    }

    return () => {
      if (verifyTimerRef.current) {
        clearTimeout(verifyTimerRef.current);
      }
    };
  }, [selectedBank, bankAccountNumber, verifyBankAccount, verifyingAccount, accountVerified]);

  // Success screen
  if (withdrawalSuccess && withdrawalResult) {
    return (
      <View className="flex-1 bg-white">
        <LinearGradient
          colors={['#0066A1', '#004d79']}
          className="pt-12 pb-32"
        >
          <View className="items-center">
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }}
              className="bg-white/20 w-24 h-24 rounded-full items-center justify-center mb-4"
            >
              <Ionicons name="checkmark-circle" size={60} color="white" />
            </Animated.View>
            <Text className="text-white text-2xl font-bold">Success!</Text>
            <Text className="text-white/90 mt-2">Your withdrawal is being processed</Text>
          </View>
        </LinearGradient>

        <View className="flex-1 -mt-20 bg-white rounded-t-3xl px-6 pt-8">
          <View className="bg-gray-50 rounded-2xl p-5 mb-6">
            <Text className="text-gray-600 text-sm mb-4">TRANSACTION DETAILS</Text>

            <View className="space-y-4">
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="font-bold text-lg">₦{withdrawalResult.totalAmount.toLocaleString()}</Text>
              </View>

              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-600">Accounts</Text>
                <Text className="font-semibold">{withdrawalResult.summary.accountsCount} accounts</Text>
              </View>

              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-600">Status</Text>
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-800 text-xs font-semibold">Processing</Text>
                </View>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-gray-600">Processing Time</Text>
                <Text className="font-semibold">24-48 hours</Text>
              </View>
            </View>
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Dashboard')}
              className="bg-[#0066A1] py-4 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-lg">Back to Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setWithdrawalSuccess(false);
                setWithdrawalResult(null);
                setSelectedAccounts([]);
                setCurrentStep(1);
              }}
              className="bg-gray-100 py-4 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 text-center font-semibold">Make Another Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      {/* Progress Bar */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row justify-between mb-2">
          <Text className="text-xs text-gray-500">Step {currentStep} of 3</Text>
          <Text className="text-xs text-gray-500">
            {currentStep === 1 ? 'Select Accounts' : currentStep === 2 ? 'Enter Amounts' : 'Choose Bank'}
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-[#0066A1] rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-6 py-4"
        >
          {/* Error Alert */}
          {verificationError && (
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg"
            >
              <View className="flex-row items-start">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-red-800 font-medium">{verificationError}</Text>
                  <TouchableOpacity onPress={() => setVerificationError(null)} className="mt-1">
                    <Text className="text-red-700 text-xs font-medium">Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {fetchingAccounts ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#0066A1" />
              <Text className="text-gray-500 mt-4">Loading your accounts...</Text>
            </View>
          ) : accounts.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="wallet-outline" size={32} color="#6b7280" />
              </View>
              <Text className="text-gray-900 font-semibold text-lg mb-2">No Available Funds</Text>
              <Text className="text-gray-500 text-center mb-6">
                You don't have any accounts with available balance for withdrawal.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="bg-[#0066A1] px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Step 1: Select Accounts */}
              {currentStep === 1 && (
                <View>
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Select Accounts</Text>
                  <Text className="text-gray-600 mb-6">Choose which accounts to withdraw from</Text>

                  <View className="space-y-3">
                    {accounts.map((account) => {
                      const isSelected = selectedAccounts.some(
                        (selected) => selected.accountId === account._id
                      );

                      return (
                        <Pressable
                          key={account._id}
                          onPress={() => toggleAccountSelection(account)}
                          className={`bg-white p-4 rounded-2xl border-2 mb-2 ${
                            isSelected ? 'border-[#0066A1]' : 'border-transparent'
                          }`}
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                          }}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <View className="flex-row items-center mb-1">
                                <View className={`w-2 h-2 rounded-full mr-2 ${
                                  account.accountType === 'ds' ? 'bg-blue-500' :
                                  account.accountType === 'ibs' ? 'bg-green-500' : 'bg-purple-500'
                                }`} />
                                <Text className="font-semibold text-gray-900">
                                  {account.accountType.toUpperCase()} Account
                                </Text>
                              </View>
                              <Text className="text-sm text-gray-500 mb-2">{account.accountNumber}</Text>
                              <Text className="text-lg font-bold text-gray-900">
                                ₦{account.availableBalance.toLocaleString()}
                              </Text>
                              <Text className="text-xs text-gray-500">Available balance</Text>
                            </View>
                            <View
                              className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                                isSelected
                                  ? 'bg-[#0066A1] border-[#0066A1]'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={16} color="white" />
                              )}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {selectedAccounts.length > 0 && (
                    <View className="mt-6">
                      <TouchableOpacity
                        onPress={() => setCurrentStep(2)}
                        className="bg-[#0066A1] py-4 rounded-2xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-center font-semibold text-lg">
                          Continue ({selectedAccounts.length} selected)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Step 2: Enter Amounts */}
              {currentStep === 2 && (
                <View>
                  <View className="flex-row items-center mb-6">
                    <View>
                      <Text className="text-2xl font-bold text-gray-900">Enter Amounts</Text>
                      <Text className="text-gray-600">Specify how much to withdraw</Text>
                    </View>
                  </View>

                  <View className="space-y-4">
                    {selectedAccounts.map((selectedAccount) => (
                      <View
                        key={selectedAccount.accountId}
                        className="bg-white rounded-2xl p-4"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="font-semibold text-gray-900">
                            {selectedAccount.accountType.toUpperCase()} • {selectedAccount.accountNumber}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setMaxAmount(selectedAccount.accountId)}
                            className="bg-blue-50 px-3 py-1 rounded-full"
                          >
                            <Text className="text-[#0066A1] text-xs font-semibold">MAX</Text>
                          </TouchableOpacity>
                        </View>
                        <View className="bg-gray-50 rounded-xl p-3">
                          <Text className="text-xs text-gray-500 mb-1">Amount to withdraw</Text>
                          <View className="flex-row items-center">
                            <Text className="text-2xl font-bold text-gray-400 mr-2">₦</Text>
                            <TextInput
                              value={selectedAccount.amount}
                              onChangeText={(text) =>
                                updateAccountAmount(selectedAccount.accountId, text)
                              }
                              placeholder="0.00"
                              keyboardType="numeric"
                              className="flex-1 text-2xl font-bold text-gray-900"
                              placeholderTextColor="#9ca3af"
                            />
                          </View>
                          <Text className="text-xs text-gray-500 mt-2">
                            Available: ₦{selectedAccount.availableBalance.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {totalWithdrawalAmount > 0 && (
                    <View className="bg-[#0066A1]/10 rounded-2xl p-4 mt-6">
                      <Text className="text-sm text-gray-700 mb-1">Total Withdrawal</Text>
                      <Text className="text-3xl font-bold text-[#0066A1]">
                        ₦{totalWithdrawalAmount.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  <View className="mt-6 space-y-3">
                    <TouchableOpacity
                      onPress={() => validateWithdrawals() && setCurrentStep(3)}
                      disabled={!validateWithdrawals()}
                      className={`py-4 rounded-2xl ${
                        validateWithdrawals() ? 'bg-[#0066A1]' : 'bg-gray-300'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        Continue to Bank Selection
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3: Choose Bank */}
              {currentStep === 3 && (
                <View>
                  <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => setCurrentStep(2)} className="mr-3">
                      <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View>
                      <Text className="text-2xl font-bold text-gray-900">Recipient Account</Text>
                      <Text className="text-gray-600">Choose where to send funds</Text>
                    </View>
                  </View>

                  {/* Saved Accounts */}
                  {savedAccounts.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-sm font-semibold text-gray-700 mb-3">Recent Accounts</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {savedAccounts
                          .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                          .slice(0, 3)
                          .map((account) => (
                            <TouchableOpacity
                              key={account.id}
                              onPress={() => selectSavedAccount(account)}
                              className="bg-white p-4 rounded-2xl mr-3"
                              style={{
                                width: screenWidth * 0.7,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                              }}
                            >
                              <View className="flex-row items-center mb-2">
                                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                                  <Ionicons name="business" size={20} color="#0066A1" />
                                </View>
                                <View className="flex-1">
                                  <Text className="font-semibold text-gray-900" numberOfLines={1}>
                                    {account.accountName}
                                  </Text>
                                  <Text className="text-xs text-gray-500">
                                    {account.bankName} • {account.accountNumber}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </View>
                  )}

                  {accountVerified ? (
                    <View
                      className="bg-green-50 border-2 border-green-200 rounded-2xl p-4"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-bold text-gray-900 text-lg">{bankAccountName}</Text>
                          <Text className="text-sm text-gray-600 mt-1">
                            {banks.find((bank) => bank.code === selectedBank)?.name}
                          </Text>
                          <Text className="text-sm text-gray-500">{bankAccountNumber}</Text>
                        </View>
                        <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={24} color="white" />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowBankSelector(true)}
                      className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center"
                      activeOpacity={0.8}
                    >
                      <View className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                        <Ionicons name="add" size={24} color="#6b7280" />
                      </View>
                      <Text className="text-gray-900 font-semibold">Add Bank Account</Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Select your bank and enter account details
                      </Text>
                    </TouchableOpacity>
                  )}

                  {accountVerified && (
                    <View className="mt-6 space-y-3">
                      <TouchableOpacity
                        onPress={processWithdrawal}
                        disabled={loading}
                        className="bg-[#0066A1] py-4 rounded-2xl"
                        activeOpacity={0.8}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="text-white text-center font-semibold text-lg">
                            Withdraw ₦{totalWithdrawalAmount.toLocaleString()}
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowBankSelector(true)}
                        className="bg-gray-100 py-4 rounded-2xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-gray-700 text-center font-semibold">
                          Use Different Account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bank Selector Modal */}
      <Modal
        visible={showBankSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankSelector(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Add Bank Account</Text>
              <TouchableOpacity
                onPress={() => setShowBankSelector(false)}
                className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Bank Search */}
            <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex-row items-center">
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                value={bankSearchQuery}
                onChangeText={setBankSearchQuery}
                placeholder="Search banks..."
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Bank List */}
            <FlatList
              data={filteredBanks}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500">No banks found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item.code);
                    setBankSearchQuery('');
                  }}
                  className={`p-4 border-b border-gray-100 flex-row items-center ${
                    selectedBank === item.code ? 'bg-blue-50' : ''
                  }`}
                >
                  <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Text className="text-gray-600 font-bold">{item.name.charAt(0)}</Text>
                  </View>
                  <Text
                    className={`flex-1 ${
                      selectedBank === item.code ? 'text-[#0066A1] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Text>
                  {selectedBank === item.code && (
                    <Ionicons name="checkmark-circle" size={20} color="#0066A1" />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />

            {/* Account Number Input */}
            {selectedBank && (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Account Number</Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                  <TextInput
                    value={bankAccountNumber}
                    onChangeText={handleBankAccountNumberChange}
                    placeholder="Enter 10-digit account number"
                    keyboardType="numeric"
                    maxLength={10}
                    className="flex-1 text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  {bankAccountNumber.length === 10 && verifyingAccount && (
                    <ActivityIndicator size="small" color="#0066A1" />
                  )}
                </View>
                {bankAccountNumber.length > 0 && bankAccountNumber.length < 10 && (
                  <Text className="text-xs text-gray-500 mt-1 ml-4">
                    {10 - bankAccountNumber.length} more digit{10 - bankAccountNumber.length !== 1 ? 's' : ''} required
                  </Text>
                )}
              </View>
            )}

            {/* Account Name Display */}
            {bankAccountNumber.length === 10 && (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Account Name</Text>
                <View className="bg-gray-100 rounded-xl px-4 py-4 flex-row items-center">
                  {verifyingAccount ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#0066A1" />
                      <Text className="text-gray-500 ml-3">Verifying...</Text>
                    </View>
                  ) : bankAccountName ? (
                    <>
                      <Text className="flex-1 text-gray-900 font-semibold">{bankAccountName}</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </>
                  ) : (
                    <Text className="text-gray-500">Waiting for verification...</Text>
                  )}
                </View>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={() => accountVerified && setShowBankSelector(false)}
              disabled={!accountVerified}
              className={`mt-6 py-4 rounded-2xl ${
                accountVerified ? 'bg-[#0066A1]' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {accountVerified ? 'Use This Account' : 'Verify Account First'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}