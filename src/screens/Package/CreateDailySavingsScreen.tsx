/**
 * Create Daily Savings Package Screen
 * Professional form for creating daily savings packages
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from 'react-native';
import type { PackageScreenProps } from '@/navigation/types';
import { FormSection, FormActions } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import packagesService, { CreateDailySavingsPackageParams } from '@/services/api/packages';
import accountsService from '@/services/api/accounts';
import Toast from 'react-native-toast-message';

// Predefined savings targets
const PREDEFINED_TARGETS = [
    'School Fees',
    'House Rent',
    'Building Projects',
    'Shop Rent',
    'Vacation',
    'Wedding',
    'Education',
    'Healthcare',
    'Business',
    'Staff Salaries',
    'Donations',
    'Emergency Fund',
];

export default function CreateDailySavingsScreen({ navigation }: PackageScreenProps<'CreateDailySavings'>) {
    // Form state
    const [target, setTarget] = useState('');
    const [amountPerDay, setAmountPerDay] = useState('');
    const [errors, setErrors] = useState<{ target?: string; amountPerDay?: string }>({});
    const [showCustomTarget, setShowCustomTarget] = useState(false);
    const [selectedPredefinedTarget, setSelectedPredefinedTarget] = useState<string>('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const targetInputRef = useRef<any>(null);
    const amountInputRef = useRef<any>(null);

    // Check if user has DS account
    const { data: hasAccount, isLoading: checkingAccount } = useQuery({
        queryKey: ['check-account', 'ds'],
        queryFn: () => packagesService.checkAccountType('ds'),
    });

    // Create DS account mutation
    const createAccountMutation = useMutation({
        mutationFn: () => accountsService.createAccount('ds'),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'Your Daily Savings account has been created successfully',
            });
            // Refetch account status
            // In a real app, you'd invalidate the query to refetch
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Failed to Create Account',
                text2: error?.message || 'Something went wrong',
            });
        },
    });

    // Create package mutation
    const createPackageMutation = useMutation({
        mutationFn: (data: CreateDailySavingsPackageParams) =>
            packagesService.createDailySavingsPackage(data),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Package Created',
                text2: 'Your Daily Savings package has been created successfully',
                visibilityTime: 3000,
            });

            // Navigate back to package home
            navigation.navigate('PackageHome');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || 'Failed to create package';
            Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: message,
            });
        },
    });

    // Validation
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!target.trim()) {
            newErrors.target = 'Target is required';
        } else if (target.trim().length < 3) {
            newErrors.target = 'Target must be at least 3 characters';
        }

        const amount = parseFloat(amountPerDay);
        if (!amountPerDay.trim()) {
            newErrors.amountPerDay = 'Amount is required';
        } else if (isNaN(amount) || amount <= 0) {
            newErrors.amountPerDay = 'Amount must be greater than 0';
        } else if (amount < 1000) {
            newErrors.amountPerDay = 'Minimum amount is ₦1,000';
        } else if (amount > 1000000) {
            newErrors.amountPerDay = 'Maximum amount is ₦1,000,000';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please check all fields and try again',
            });
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    // Handle package creation after confirmation
    const handleConfirmCreate = () => {
        const packageData: CreateDailySavingsPackageParams = {
            target: target.trim(),
            amountPerDay: parseFloat(amountPerDay),
        };
        createPackageMutation.mutate(packageData);
        setShowConfirmModal(false);
    };

    // Handle account creation
    const handleCreateAccount = () => {
        Alert.alert(
            'Create Daily Savings Account',
            'You need to have a Daily Savings account to create packages. Would you like to create one now?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => navigation.goBack(),
                },
                {
                    text: 'Create Account',
                    onPress: () => createAccountMutation.mutate(),
                },
            ]
        );
    };

    // Calculate estimated values accounting for admin fee
    // First contribution of each 30-day cycle goes to admin fee
    const calculateEstimates = () => {
        const amount = parseFloat(amountPerDay) || 0;

        // Helper function to calculate actual savings after admin fees
        const calculateNetSavings = (days: number) => {
            const cycles = Math.floor(days / 30); // Number of complete 30-day cycles
            const remainingDays = days % 30; // Days in incomplete cycle

            // Each cycle: 1 day admin fee + 29 days savings
            const savingsFromCompleteCycles = cycles * (29 * amount);

            // For remaining days: if it's the start of a new cycle, first day is admin fee
            const savingsFromRemainingDays = remainingDays > 0
                ? (remainingDays - 1) * amount  // First day of new cycle is admin fee
                : 0;

            return savingsFromCompleteCycles + savingsFromRemainingDays;
        };

        return {
            monthly: calculateNetSavings(30),   // 30 days: 1 admin fee, 29 savings
            quarterly: calculateNetSavings(90), // 90 days: 3 admin fees, 87 savings
            yearly: calculateNetSavings(365),   // 365 days: 12 admin fees, 353 savings
        };
    };

    const estimates = calculateEstimates();

    // Loading state
    if (checkingAccount) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066A1" />
                <Text style={styles.loadingText}>Checking account status...</Text>
            </View>
        );
    }

    // No account state
    if (hasAccount === false) {
        return (
            <View style={styles.container}>
                <View style={styles.noAccountContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-circle" size={64} color="#ef4444" />
                    </View>
                    <Text style={styles.noAccountTitle}>Daily Savings Account Required</Text>
                    <Text style={styles.noAccountText}>
                        You need to have a Daily Savings account before creating a package.
                    </Text>
                    <Button
                        title="Create Daily Savings Account"
                        onPress={handleCreateAccount}
                        loading={createAccountMutation.isPending}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="add-circle"
                    />
                    <Button
                        title="Go Back"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                        size="md"
                        fullWidth
                        leftIcon="arrow-back"
                        disabled={createAccountMutation.isPending}
                    />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="calendar" size={32} color="#0066A1" />
                    </View>
                    <Text style={styles.headerTitle}>Create Daily Savings Package</Text>
                    <Text style={styles.headerSubtitle}>
                        Set a savings goal and save daily towards it
                    </Text>
                </View>

                <FormSection title="Package Details" description="Select or enter your savings target and daily amount">
                    <View>
                        <Text style={styles.fieldLabel}>Savings Target</Text>

                        {/* Predefined Targets Grid */}
                        <View style={styles.targetsGrid}>
                            {PREDEFINED_TARGETS.map((predefinedTarget) => (
                                <TouchableOpacity
                                    key={predefinedTarget}
                                    style={[
                                        styles.targetChip,
                                        selectedPredefinedTarget === predefinedTarget && styles.targetChipSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedPredefinedTarget(predefinedTarget);
                                        setTarget(predefinedTarget);
                                        setShowCustomTarget(false);
                                        if (errors.target) {
                                            setErrors({ ...errors, target: undefined });
                                        }
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.targetChipText,
                                            selectedPredefinedTarget === predefinedTarget && styles.targetChipTextSelected,
                                        ]}
                                    >
                                        {predefinedTarget}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {/* Custom Target Option */}
                            <TouchableOpacity
                                style={[
                                    styles.targetChip,
                                    showCustomTarget && styles.targetChipSelected,
                                ]}
                                onPress={() => {
                                    setShowCustomTarget(true);
                                    setSelectedPredefinedTarget('');
                                    setTarget('');
                                    setTimeout(() => targetInputRef.current?.focus(), 100);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.targetChipText,
                                        showCustomTarget && styles.targetChipTextSelected,
                                    ]}
                                >
                                    <Ionicons name="add-circle-outline" size={16} /> Custom
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Custom Target Input */}
                        {showCustomTarget && (
                            <Input
                                ref={targetInputRef}
                                placeholder="Enter your custom savings target"
                                value={target}
                                onChangeText={(text) => {
                                    setTarget(text);
                                    if (errors.target) {
                                        setErrors({ ...errors, target: undefined });
                                    }
                                }}
                                errorText={errors.target}
                                leftIcon="flag"
                                returnKeyType="next"
                                onSubmitEditing={() => amountInputRef.current?.focus()}
                                maxLength={50}
                                containerStyle={{ marginTop: 12 }}
                            />
                        )}

                        {errors.target && !showCustomTarget && (
                            <Text style={styles.errorText}>{errors.target}</Text>
                        )}
                    </View>

                    <View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.fieldLabel}>Amount Per Day (₦)</Text>
                            <Text style={styles.flagEmoji}>🇳🇬</Text>
                        </View>
                        <Input
                            ref={amountInputRef}
                            placeholder="Enter daily savings amount"
                            value={amountPerDay}
                            onChangeText={(text) => {
                                // Only allow numbers and decimal point
                                const cleaned = text.replace(/[^0-9.]/g, '');
                                // Prevent multiple decimal points
                                const parts = cleaned.split('.');
                                if (parts.length > 2) return;
                                if (parts[1] && parts[1].length > 2) return; // Max 2 decimal places

                                setAmountPerDay(cleaned);
                                if (errors.amountPerDay) {
                                    setErrors({ ...errors, amountPerDay: undefined });
                                }
                            }}
                            errorText={errors.amountPerDay}
                            helperText="Minimum: ₦1,000 | Maximum: ₦1,000,000"
                            leftIcon="cash"
                            keyboardType="decimal-pad"
                            returnKeyType="done"
                        />
                    </View>
                </FormSection>

                {amountPerDay && parseFloat(amountPerDay) > 0 && (
                    <View style={styles.estimatesCard}>
                        <View style={styles.estimatesHeader}>
                            <Text style={styles.estimatesTitle}>Savings Estimates</Text>
                        </View>
                        <View style={styles.estimatesGrid}>
                            <View style={styles.estimateItem}>
                                <Text style={styles.estimateLabel}>Monthly</Text>
                                <Text style={styles.estimateValue}>₦{estimates.monthly.toLocaleString()}</Text>
                            </View>
                            <View style={styles.estimateItem}>
                                <Text style={styles.estimateLabel}>Quarterly</Text>
                                <Text style={styles.estimateValue}>₦{estimates.quarterly.toLocaleString()}</Text>
                            </View>
                            <View style={styles.estimateItem}>
                                <Text style={styles.estimateLabel}>Yearly</Text>
                                <Text style={styles.estimateValue}>₦{estimates.yearly.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <FormActions sticky>
                <Button
                    title="Create Package"
                    onPress={handleSubmit}
                    loading={createPackageMutation.isPending}
                    disabled={createPackageMutation.isPending || !target || !amountPerDay}
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon="checkmark-circle"
                />
            </FormActions>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Ionicons name="information-circle" size={48} color="#0066A1" />
                            </View>
                            <Text style={styles.modalTitle}>Confirm Package Creation</Text>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.confirmationItem}>
                                <Text style={styles.confirmLabel}>Savings Target</Text>
                                <Text style={styles.confirmValue}>{target}</Text>
                            </View>

                            <View style={styles.confirmDivider} />

                            <View style={styles.confirmationItem}>
                                <Text style={styles.confirmLabel}>Daily Amount</Text>
                                <Text style={styles.confirmValue}>₦{parseFloat(amountPerDay || '0').toLocaleString()}</Text>
                            </View>

                            <View style={styles.confirmDivider} />

                            <View style={styles.confirmationItem}>
                                <Text style={styles.confirmLabel}>Monthly Savings</Text>
                                <Text style={styles.confirmValueHighlight}>₦{estimates.monthly.toLocaleString()}</Text>
                            </View>

                            <View style={styles.adminFeeInfo}>
                                <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
                                <Text style={styles.adminFeeText}>
                                    First contribution of each 30-day cycle goes to admin fees
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Button
                                    title="Cancel"
                                    onPress={() => setShowConfirmModal(false)}
                                    variant="outline"
                                    size="md"
                                    fullWidth
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Button
                                    title="Confirm"
                                    onPress={handleConfirmCreate}
                                    variant="primary"
                                    size="md"
                                    leftIcon="checkmark"
                                    loading={createPackageMutation.isPending}
                                    disabled={createPackageMutation.isPending}
                                    fullWidth
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    headerIcon: {
        width: 64,
        height: 64,
        backgroundColor: '#e6f2ff',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    noAccountContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    noAccountTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    noAccountText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 32,
    },
    estimatesCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    estimatesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    estimatesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    estimateItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 12,
    },
    estimateLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    estimateValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0066A1',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#e6f2ff',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#0066A1',
        lineHeight: 18,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    targetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    targetChip: {
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    targetChipSelected: {
        backgroundColor: '#e6f2ff',
        borderColor: '#0066A1',
    },
    targetChipText: {
        fontSize: 13,
        color: '#6b7280',
    },
    targetChipTextSelected: {
        color: '#0066A1',
        fontWeight: '500',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    flagEmoji: {
        fontSize: 20,
    },
    estimatesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    estimatesNote: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalIconContainer: {
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    modalBody: {
        padding: 20,
    },
    confirmationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    confirmLabel: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    confirmValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
        textAlign: 'right',
    },
    confirmValueHighlight: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066A1',
        flex: 1,
        textAlign: 'right',
    },
    confirmNote: {
        fontSize: 11,
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'right',
        marginTop: 2,
    },
    confirmDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    adminFeeInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    adminFeeText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#92400e',
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
});
