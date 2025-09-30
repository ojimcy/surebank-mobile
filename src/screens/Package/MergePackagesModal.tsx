/**
 * Merge Packages Modal
 * Allows users to merge multiple SB packages into one target package
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import packagesService, { type SBPackage } from '@/services/api/packages';

interface MergePackagesModalProps {
    visible: boolean;
    onClose: () => void;
    targetPackageId: string;
    onSuccess: () => void;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

export default function MergePackagesModal({
    visible,
    onClose,
    targetPackageId,
    onSuccess,
}: MergePackagesModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availablePackages, setAvailablePackages] = useState<SBPackage[]>([]);
    const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            fetchAvailablePackages();
        }
    }, [visible, targetPackageId]);

    const fetchAvailablePackages = async () => {
        try {
            setLoading(true);
            const response = await packagesService.getAllPackages();
            // Filter out the target package and only show active SB packages
            const filteredPackages = response.sbPackages.filter(
                pkg => pkg._id !== targetPackageId && pkg.status === 'active'
            );
            setAvailablePackages(filteredPackages);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            Alert.alert('Error', 'Failed to load available packages');
        } finally {
            setLoading(false);
        }
    };

    const togglePackageSelection = (packageId: string) => {
        setSelectedPackageIds(prev => {
            if (prev.includes(packageId)) {
                return prev.filter(id => id !== packageId);
            } else {
                return [...prev, packageId];
            }
        });
    };

    const handleMerge = async () => {
        if (selectedPackageIds.length === 0) {
            Alert.alert('No Selection', 'Please select at least one package to merge');
            return;
        }

        Alert.alert(
            'Confirm Merge',
            `Are you sure you want to merge ${selectedPackageIds.length} package(s) into this package? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Merge',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await packagesService.mergeSavingsPackages(
                                targetPackageId,
                                selectedPackageIds
                            );
                            Alert.alert('Success', 'Packages merged successfully');
                            onSuccess();
                            onClose();
                        } catch (error: any) {
                            console.error('Failed to merge packages:', error);
                            Alert.alert(
                                'Error',
                                error?.response?.data?.message || 'Failed to merge packages'
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const getTotalContribution = () => {
        return selectedPackageIds.reduce((sum, id) => {
            const pkg = availablePackages.find(p => p._id === id);
            return sum + (pkg?.totalContribution || 0);
        }, 0);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Merge Packages</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7952B3" />
                        <Text style={styles.loadingText}>Loading packages...</Text>
                    </View>
                ) : availablePackages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>No Packages Available</Text>
                        <Text style={styles.emptySubtext}>
                            You need at least one other active SB package to merge
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Instructions */}
                        <View style={styles.instructionsContainer}>
                            <Ionicons name="information-circle-outline" size={20} color="#7952B3" />
                            <Text style={styles.instructionsText}>
                                Select packages to merge into the current package. All contributions
                                will be combined.
                            </Text>
                        </View>

                        {/* Package List */}
                        <ScrollView style={styles.scrollView}>
                            {availablePackages.map(pkg => (
                                <TouchableOpacity
                                    key={pkg._id}
                                    style={[
                                        styles.packageItem,
                                        selectedPackageIds.includes(pkg._id) &&
                                            styles.packageItemSelected,
                                    ]}
                                    onPress={() => togglePackageSelection(pkg._id)}
                                >
                                    <View style={styles.checkbox}>
                                        {selectedPackageIds.includes(pkg._id) && (
                                            <Ionicons name="checkmark" size={20} color="white" />
                                        )}
                                    </View>

                                    <View style={styles.packageInfo}>
                                        <Text style={styles.packageName}>
                                            {pkg.product?.name || 'SB Package'}
                                        </Text>
                                        <Text style={styles.packageAccount}>{pkg.accountNumber}</Text>
                                    </View>

                                    <View style={styles.packageAmounts}>
                                        <Text style={styles.packageAmount}>
                                            {formatCurrency(pkg.totalContribution)}
                                        </Text>
                                        <Text style={styles.packageTarget}>
                                            of {formatCurrency(pkg.targetAmount)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Summary */}
                        {selectedPackageIds.length > 0 && (
                            <View style={styles.summaryContainer}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Selected Packages:</Text>
                                    <Text style={styles.summaryValue}>
                                        {selectedPackageIds.length}
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total Contribution:</Text>
                                    <Text style={[styles.summaryValue, styles.summaryAmount]}>
                                        {formatCurrency(getTotalContribution())}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={submitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.mergeButton,
                                    (selectedPackageIds.length === 0 || submitting) &&
                                        styles.mergeButtonDisabled,
                                ]}
                                onPress={handleMerge}
                                disabled={selectedPackageIds.length === 0 || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.mergeButtonText}>Merge Packages</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 8,
    },
    instructionsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f0ff',
        padding: 12,
        margin: 16,
        borderRadius: 8,
        gap: 8,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        color: '#6b46c1',
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    packageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    packageItemSelected: {
        borderColor: '#7952B3',
        backgroundColor: '#f9f7ff',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: 'transparent',
    },
    packageInfo: {
        flex: 1,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    packageAccount: {
        fontSize: 12,
        color: '#6b7280',
    },
    packageAmounts: {
        alignItems: 'flex-end',
    },
    packageAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    packageTarget: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    summaryContainer: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        fontSize: 16,
        color: '#7952B3',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    mergeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#7952B3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mergeButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    mergeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});