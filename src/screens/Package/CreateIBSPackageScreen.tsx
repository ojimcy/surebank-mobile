/**
 * Create Interest-Based Savings Package Screen
 * Professional form for creating IBS packages with fixed lock periods and guaranteed returns
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as WebBrowser from 'expo-web-browser';
import type { PackageScreenProps } from '@/navigation/types';
import packagesService from '@/services/api/packages';
import accountsApi from '@/services/api/accounts';
import { IB_PACKAGE_OPTIONS } from '@/constants/packages';
import { formatCurrency } from '@/utils/format';
import { addDays, format } from 'date-fns';

interface FormData {
    name: string;
    principalAmount: string;
    lockPeriod: number;
    compoundingFrequency: string;
}

const validationSchema = yup.object({
    name: yup
        .string()
        .required('Package name is required')
        .min(3, 'Package name must be at least 3 characters')
        .max(50, 'Package name must be less than 50 characters'),
    principalAmount: yup
        .string()
        .required('Amount is required')
        .test('min-amount', `Minimum amount is ${formatCurrency(IB_PACKAGE_OPTIONS.minAmount)}`,
            value => !value || parseFloat(value) >= IB_PACKAGE_OPTIONS.minAmount)
        .test('max-amount', `Maximum amount is ${formatCurrency(IB_PACKAGE_OPTIONS.maxAmount)}`,
            value => !value || parseFloat(value) <= IB_PACKAGE_OPTIONS.maxAmount),
    lockPeriod: yup
        .number()
        .required('Lock period is required')
        .oneOf(IB_PACKAGE_OPTIONS.lockPeriods.map(p => p.value), 'Please select a valid lock period'),
    compoundingFrequency: yup
        .string()
        .required('Compounding frequency is required')
        .oneOf(IB_PACKAGE_OPTIONS.compoundingFrequencies.map(f => f.value), 'Please select a valid frequency'),
});

export default function CreateIBSPackageScreen({ navigation }: PackageScreenProps<'CreateIBSPackage'>) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [hasIBSAccount, setHasIBSAccount] = useState<boolean | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            principalAmount: '',
            lockPeriod: IB_PACKAGE_OPTIONS.lockPeriods[0].value,
            compoundingFrequency: 'monthly',
        },
    });

    const watchedValues = watch();
    const principalAmount = parseFloat(watchedValues.principalAmount || '0');
    const lockPeriod = watchedValues.lockPeriod;

    // Calculate interest and maturity details
    const calculatedDetails = useMemo(() => {
        const lockPeriodOption = IB_PACKAGE_OPTIONS.lockPeriods.find(p => p.value === lockPeriod) || IB_PACKAGE_OPTIONS.lockPeriods[0];
        const interestRate = lockPeriodOption.rate;
        const maturityDate = addDays(new Date(), lockPeriod);

        // Simple interest calculation for display (actual calculation may be compound)
        const totalInterest = (principalAmount * interestRate * (lockPeriod / 365)) / 100;
        const maturityAmount = principalAmount + totalInterest;

        return {
            interestRate,
            maturityDate,
            totalInterest,
            maturityAmount,
            lockPeriodLabel: lockPeriodOption.label,
        };
    }, [principalAmount, lockPeriod]);

    // Check if user has IBS account
    const { data: accountStatus, isLoading: isCheckingAccount } = useQuery({
        queryKey: ['account-status', 'ibs'],
        queryFn: async () => {
            const hasAccount = await accountsApi.hasAccountType('ibs');
            return { hasAccount };
        },
        enabled: hasIBSAccount === null,
    });

    useEffect(() => {
        if (accountStatus) {
            setHasIBSAccount(accountStatus.hasAccount);
            if (!accountStatus.hasAccount) {
                setShowAccountModal(true);
            }
        }
    }, [accountStatus]);

    // Create IBS account mutation
    const createAccountMutation = useMutation({
        mutationFn: () => accountsApi.createAccount('ibs'),
        onSuccess: () => {
            setHasIBSAccount(true);
            setShowAccountModal(false);
            Alert.alert('Success', 'IBS account created successfully!');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create account');
        },
    });

    // Initiate payment mutation
    const initiatePaymentMutation = useMutation({
        mutationFn: (data: {
            name: string;
            principalAmount: number;
            lockPeriod: number;
            compoundingFrequency: string;
            interestRate: number;
        }) => packagesService.initiateIBPackagePayment(data),
        onSuccess: async (response: any) => {
            // Handle Paystack payment URL
            const paymentUrl = response.authorization_url;

            if (!paymentUrl) {
                Alert.alert('Error', 'Failed to get payment URL. Please try again.');
                return;
            }

            // Open the Paystack payment URL in the browser
            try {
                const result = await WebBrowser.openBrowserAsync(paymentUrl, {
                    dismissButtonStyle: 'close',
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                });

                // If browser was closed by user
                if (result.type === 'dismiss' || result.type === 'cancel') {
                    Alert.alert(
                        'Payment Incomplete',
                        'You closed the payment window. Your package creation has been cancelled.',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.goBack(),
                            },
                        ]
                    );
                }
            } catch (error) {
                console.error('Failed to open payment URL:', error);
                Alert.alert('Error', 'Failed to open payment page. Please try again.');
            }
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payment');
        },
    });

    const onSubmit = () => {
        if (!hasIBSAccount) {
            setShowAccountModal(true);
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmCreate = () => {
        setShowConfirmModal(false);

        initiatePaymentMutation.mutate({
            name: watchedValues.name,
            principalAmount: parseFloat(watchedValues.principalAmount),
            lockPeriod: watchedValues.lockPeriod,
            compoundingFrequency: watchedValues.compoundingFrequency,
            interestRate: calculatedDetails.interestRate,
        });
    };

    const handleLockPeriodChange = (value: number) => {
        setValue('lockPeriod', value);
    };

    if (isCheckingAccount) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#00AAA1" />
                <Text className="mt-4 text-gray-600">Checking account status...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="p-6">
                    {/* Header Info */}
                    <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#16a34a" />
                            <Text className="ml-2 text-green-800 font-semibold">About IBS Packages</Text>
                        </View>
                        <Text className="text-green-700 text-sm leading-5">
                            Lock your funds for a fixed period and earn guaranteed returns with competitive interest rates.
                            The longer you lock, the higher your returns!
                        </Text>
                    </View>

                    {/* Package Name */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-medium mb-2">Package Name</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`bg-white border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3`}
                                    placeholder="e.g., My Investment Fund"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize="words"
                                />
                            )}
                        />
                        {errors.name && (
                            <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
                        )}
                    </View>

                    {/* Principal Amount */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-medium mb-2">Investment Amount (₦)</Text>
                        <Controller
                            control={control}
                            name="principalAmount"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`bg-white border ${errors.principalAmount ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3`}
                                    placeholder={`Min: ${formatCurrency(IB_PACKAGE_OPTIONS.minAmount)}`}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                />
                            )}
                        />
                        {errors.principalAmount && (
                            <Text className="text-red-500 text-sm mt-1">{errors.principalAmount.message}</Text>
                        )}
                        <Text className="text-gray-500 text-xs mt-1">
                            Minimum: {formatCurrency(IB_PACKAGE_OPTIONS.minAmount)} • Maximum: {formatCurrency(IB_PACKAGE_OPTIONS.maxAmount)}
                        </Text>
                    </View>

                    {/* Lock Period */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-medium mb-2">Lock Period</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {IB_PACKAGE_OPTIONS.lockPeriods.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleLockPeriodChange(option.value)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        watchedValues.lockPeriod === option.value
                                            ? 'bg-green-500 border-green-500'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <Text className={`text-sm font-medium ${
                                        watchedValues.lockPeriod === option.value
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}>
                                        {option.label}
                                    </Text>
                                    <Text className={`text-xs ${
                                        watchedValues.lockPeriod === option.value
                                            ? 'text-green-100'
                                            : 'text-gray-500'
                                    }`}>
                                        {option.rate}% p.a.
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Investment Summary */}
                    {principalAmount > 0 && (
                        <View className="bg-green-50 rounded-xl p-4 mb-6">
                            <Text className="text-green-800 font-semibold mb-3">Investment Summary</Text>

                            <View className="space-y-2">
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Principal Amount:</Text>
                                    <Text className="text-gray-800 font-medium">{formatCurrency(principalAmount)}</Text>
                                </View>

                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Interest Rate:</Text>
                                    <Text className="text-gray-800 font-medium">{calculatedDetails.interestRate}% p.a.</Text>
                                </View>

                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Lock Period:</Text>
                                    <Text className="text-gray-800 font-medium">{calculatedDetails.lockPeriodLabel}</Text>
                                </View>

                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Maturity Date:</Text>
                                    <Text className="text-gray-800 font-medium">
                                        {format(calculatedDetails.maturityDate, 'MMM dd, yyyy')}
                                    </Text>
                                </View>

                                <View className="border-t border-green-200 mt-2 pt-2">
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-600">Expected Interest:</Text>
                                        <Text className="text-green-600 font-medium">
                                            {formatCurrency(calculatedDetails.totalInterest)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-700 font-semibold">Maturity Amount:</Text>
                                        <Text className="text-green-700 font-bold text-lg">
                                            {formatCurrency(calculatedDetails.maturityAmount)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Warning Message */}
                    <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <View className="flex-row items-start">
                            <Ionicons name="warning" size={20} color="#ca8a04" />
                            <View className="flex-1 ml-2">
                                <Text className="text-yellow-800 font-medium mb-1">Important Notice</Text>
                                <Text className="text-yellow-700 text-sm leading-5">
                                    Funds will be locked for the entire period. Early withdrawal may incur penalties
                                    and loss of accrued interest.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={!isValid || initiatePaymentMutation.isPending}
                        className={`rounded-xl py-4 ${
                            isValid && !initiatePaymentMutation.isPending
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                        }`}
                    >
                        {initiatePaymentMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-lg">
                                Create IBS Package
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent
                animationType="slide"
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                        <Text className="text-xl font-bold text-gray-800 mb-4">Confirm Package Creation</Text>

                        <View className="bg-gray-50 rounded-xl p-4 mb-6">
                            <View className="space-y-2">
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Package Name:</Text>
                                    <Text className="text-gray-800 font-medium">{watchedValues.name}</Text>
                                </View>
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Investment Amount:</Text>
                                    <Text className="text-gray-800 font-medium">{formatCurrency(principalAmount)}</Text>
                                </View>
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Lock Period:</Text>
                                    <Text className="text-gray-800 font-medium">{calculatedDetails.lockPeriodLabel}</Text>
                                </View>
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Interest Rate:</Text>
                                    <Text className="text-gray-800 font-medium">{calculatedDetails.interestRate}% p.a.</Text>
                                </View>
                                <View className="flex-row justify-between py-1">
                                    <Text className="text-gray-600">Maturity Date:</Text>
                                    <Text className="text-gray-800 font-medium">
                                        {format(calculatedDetails.maturityDate, 'MMM dd, yyyy')}
                                    </Text>
                                </View>
                                <View className="border-t border-gray-200 mt-2 pt-2">
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-700 font-semibold">Expected Return:</Text>
                                        <Text className="text-green-600 font-bold text-lg">
                                            {formatCurrency(calculatedDetails.maturityAmount)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text className="text-gray-600 text-sm mb-6">
                            By confirming, you agree to lock {formatCurrency(principalAmount)} for {calculatedDetails.lockPeriodLabel}.
                            You will be redirected to complete payment.
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-200 rounded-xl py-3"
                            >
                                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirmCreate}
                                className="flex-1 bg-green-500 rounded-xl py-3"
                            >
                                <Text className="text-white text-center font-medium">Confirm & Pay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Account Creation Modal */}
            <Modal
                visible={showAccountModal}
                transparent
                animationType="slide"
            >
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white rounded-2xl p-6">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                                <Ionicons name="wallet" size={32} color="#16a34a" />
                            </View>
                            <Text className="text-xl font-bold text-gray-800">IBS Account Required</Text>
                        </View>

                        <Text className="text-gray-600 text-center mb-6">
                            You need an Interest-Based Savings account to create IBS packages.
                            Would you like to create one now? It's free and instant!
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAccountModal(false);
                                    navigation.goBack();
                                }}
                                className="flex-1 bg-gray-200 rounded-xl py-3"
                            >
                                <Text className="text-gray-700 text-center font-medium">Not Now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => createAccountMutation.mutate()}
                                disabled={createAccountMutation.isPending}
                                className="flex-1 bg-green-500 rounded-xl py-3"
                            >
                                {createAccountMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-medium">Create Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}