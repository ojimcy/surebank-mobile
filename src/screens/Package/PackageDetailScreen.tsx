/**
 * Package Detail Screen
 * Professional package management and details screen
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import packagesService, { type UIPackage, type DailySavingsPackage, type SBPackage, type IBPackage } from '@/services/api/packages';
import transactionsApi, { type Transaction } from '@/services/api/transactions';
import type { PackageScreenProps } from '@/navigation/types';

// Utility function for consistent date formatting
const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '0' || dateString === 'null' || dateString === 'undefined') {
        return 'N/A';
    }

    try {
        // If it's already a formatted date string, return as is
        if (dateString.match(/^\d{1,2}\s\w{3}\s\d{4}$/)) {
            return dateString;
        }

        // Handle numeric timestamps (as strings)
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp) && dateString.match(/^\d+$/)) {
            if (timestamp === 0 || timestamp < 1000000000) {
                return 'N/A';
            }

            const dateValue = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
            const date = new Date(dateValue);

            if (isNaN(date.getTime()) || date.getFullYear() < 1971) {
                return 'N/A';
            }

            return date.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }

        // Handle ISO date strings and other string formats
        const date = new Date(dateString);
        if (isNaN(date.getTime()) || date.getFullYear() < 1971) {
            return 'N/A';
        }

        return date.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
};

// Utility function for consistent currency formatting
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

// Circular Progress Component
interface CircularProgressProps {
    progress: number;
    color: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, color }) => {
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={styles.progressCircle}>
            <Svg height={size} width={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                {/* Background Circle */}
                <Circle
                    stroke="#e5e7eb"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <Circle
                    stroke={color}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </Svg>
            {/* Center Content */}
            <View style={styles.progressCircleCenter}>
                <Text style={[styles.progressText, { color }]}>
                    {Math.round(progress)}%
                </Text>
            </View>
        </View>
    );
};

export default function PackageDetailScreen({ route, navigation }: PackageScreenProps<'PackageDetail'>) {
    const { packageId } = route.params;

    const [packageData, setPackageData] = useState<UIPackage | null>(null);
    const [rawPackageData, setRawPackageData] = useState<DailySavingsPackage | SBPackage | IBPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    const fetchPackageDetails = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Fetch all packages to find the specific one
            const apiData = await packagesService.getAllPackages();
            const uiPackages = packagesService.transformToUIPackages(apiData);

            // Find the specific package
            const foundPackage = uiPackages.find(pkg => pkg.id === packageId);

            if (!foundPackage) {
                throw new Error('Package not found');
            }

            setPackageData(foundPackage);

            // Also store raw data for detailed information
            let rawData = null;
            if (foundPackage.type === 'DS') {
                rawData = apiData.dailySavings.find(pkg => pkg.id === packageId);
            } else if (foundPackage.type === 'SB') {
                rawData = apiData.sbPackages.find(pkg => pkg._id === packageId);
            } else if (foundPackage.type === 'IBS') {
                rawData = apiData.ibPackages.find(pkg => pkg._id === packageId || pkg.id === packageId);
            }

            setRawPackageData(rawData || null);

            // Fetch package transactions (with foundPackage data available)
            await fetchTransactionsForPackage(foundPackage);

        } catch (error) {
            console.error('Failed to fetch package details:', error);
            setError(error instanceof Error ? error.message : 'Failed to load package details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchTransactionsForPackage = async (pkg: UIPackage) => {
        try {
            setTransactionsLoading(true);
            // Fetch transactions - the service will filter by packageId
            const response = await transactionsApi.getPackageTransactions(packageId, 1, 50);

            // If no transactions found by packageId, try filtering by account number
            if (response.transactions.length === 0 && pkg.accountNumber) {
                const allTransactions = await transactionsApi.getUserTransactions({ limit: 50 });
                const filteredTransactions = allTransactions.transactions.filter(
                    t => t.accountNumber === pkg.accountNumber ||
                         t.narration.toLowerCase().includes(pkg.accountNumber.toLowerCase())
                );
                setTransactions(filteredTransactions.slice(0, 10));
            } else {
                setTransactions(response.transactions.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to fetch package transactions:', error);
            // Don't show error to user, just show empty state
            setTransactions([]);
        } finally {
            setTransactionsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackageDetails();
    }, [packageId]);

    const handleRefresh = () => {
        fetchPackageDetails(true);
    };



    const handleAddContribution = () => {
        // Navigate to Deposit screen
        navigation.navigate('Deposit');
    };

    const handleWithdraw = () => {
        Alert.alert(
            'Withdraw',
            'This feature will be available soon.',
            [{ text: 'OK' }]
        );
    };

    const handleClosePackage = () => {
        Alert.alert(
            'Close Package',
            'Are you sure you want to close this package? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close', style: 'destructive', onPress: () => {
                        Alert.alert('Package Closed', 'This feature will be available soon.');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066A1" />
                    <Text style={styles.loadingText}>Loading package details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !packageData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Error</Text>
                    <Text style={styles.errorText}>
                        {error || 'Package not found'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchPackageDetails()}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#0066A1']}
                    />
                }
            >
                {/* Package Overview */}
                <PackageOverviewCard packageData={packageData} rawData={rawPackageData} />

                {/* Package Actions */}
                <PackageActionsCard
                    packageType={packageData.typeLabel}
                    color={packageData.color}
                    onAddContribution={handleAddContribution}
                    onWithdraw={handleWithdraw}
                    onClosePackage={handleClosePackage}
                />

                {/* Package Details */}
                <PackageDetailsCard packageData={packageData} rawData={rawPackageData} />

                {/* Transaction History */}
                <TransactionHistoryCard
                    transactions={transactions}
                    loading={transactionsLoading}
                    showAll={showAllTransactions}
                    onToggleShowAll={() => setShowAllTransactions(!showAllTransactions)}
                    packageColor={packageData.color}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

// Package Overview Component
interface PackageOverviewCardProps {
    packageData: UIPackage;
    rawData: any;
}

const PackageOverviewCard: React.FC<PackageOverviewCardProps> = ({ packageData, rawData }) => {
    // Calculate the correct progress based on package type
    const calculateProgress = () => {
        if (packageData.type === 'DS' && rawData) {
            // Daily Savings: Based on days (totalCount / 30)
            const totalCount = rawData.totalCount || 0;
            return Math.min(Math.floor((totalCount / 30) * 100), 100);
        } else if (packageData.type === 'SB') {
            // SB Package: Based on amount saved vs target
            return Math.min(Math.floor(packageData.progress), 100);
        } else if (packageData.type === 'IBS' && rawData) {
            // Interest-Based: Based on time elapsed towards maturity
            const today = new Date();
            const startDate = new Date(Number(rawData.startDate || rawData.createdAt));
            const maturityDate = new Date(Number(rawData.maturityDate));

            const totalDuration = maturityDate.getTime() - startDate.getTime();
            const elapsedTime = today.getTime() - startDate.getTime();

            if (totalDuration > 0) {
                return Math.min(Math.floor((elapsedTime / totalDuration) * 100), 100);
            }
            return 0;
        }
        return Math.floor(packageData.progress);
    };

    const progress = calculateProgress();

    return (
        <View style={styles.overviewCard}>
            {/* Package Header Info */}
            <View style={styles.packageHeaderInfo}>
                <View style={styles.packageTitleSection}>
                    <Text style={styles.packageTitle}>{packageData.title}</Text>
                    <View style={styles.packageBadges}>
                        <View style={[styles.typeBadge, { backgroundColor: `${packageData.color}20` }]}>
                            <Text style={[styles.typeText, { color: packageData.color }]}>
                                {packageData.typeLabel}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: packageData.statusColor }]}>
                            <Text style={styles.statusText}>{packageData.status}</Text>
                        </View>
                    </View>
                    <Text style={styles.accountNumber}>
                        Account: {packageData.accountNumber}
                    </Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Package Progress</Text>
                <View style={styles.progressContainer}>
                    <CircularProgress
                        progress={progress}
                        color={packageData.color}
                    />
                    <View style={styles.progressDetails}>
                        <View style={styles.progressItem}>
                            <Text style={styles.progressLabel}>Current Balance</Text>
                            <Text style={styles.progressValue}>
                                {formatCurrency(packageData.current)}
                            </Text>
                        </View>
                        <View style={styles.progressItem}>
                            <Text style={styles.progressLabel}>
                                {packageData.type === 'DS' ? 'Target Amount' :
                                    packageData.type === 'IBS' ? 'Principal Amount' : 'Product Price'}
                            </Text>
                            <Text style={styles.progressValue}>
                                {formatCurrency(packageData.target)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Start Date</Text>
                    <Text style={styles.detailValue}>{formatDate(packageData.startDate)}</Text>
                </View>
                {packageData.endDate && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>End Date</Text>
                        <Text style={styles.detailValue}>{formatDate(packageData.endDate)}</Text>
                    </View>
                )}
                {packageData.interestRate && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Interest Rate</Text>
                        <Text style={styles.detailValue}>{packageData.interestRate}</Text>
                    </View>
                )}
                {packageData.maturityDate && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Maturity Date</Text>
                        <Text style={styles.detailValue}>{formatDate(packageData.maturityDate)}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// Package Actions Component
interface PackageActionsCardProps {
    packageType: string;
    color: string;
    onAddContribution: () => void;
    onWithdraw: () => void;
    onClosePackage: () => void;
}

const PackageActionsCard: React.FC<PackageActionsCardProps> = ({
    packageType,
    color,
    onAddContribution,
    onWithdraw,
    onClosePackage
}) => {
    return (
        <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Actions</Text>

            {packageType === 'SB Package' ? (
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: color }]}
                        onPress={() => Alert.alert('Buy Product', 'This feature will be available soon.')}
                    >
                        <Ionicons name="bag-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Buy Product</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonOutline}
                        onPress={onWithdraw}
                    >
                        <Ionicons name="wallet-outline" size={20} color="#374151" />
                        <Text style={styles.actionButtonOutlineText}>Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonOutline}
                        onPress={() => Alert.alert('Merge', 'This feature will be available soon.')}
                    >
                        <Ionicons name="git-merge-outline" size={20} color="#374151" />
                        <Text style={styles.actionButtonOutlineText}>Merge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonOutline}
                        onPress={() => Alert.alert('Change Product', 'This feature will be available soon.')}
                    >
                        <Ionicons name="swap-horizontal-outline" size={20} color="#374151" />
                        <Text style={styles.actionButtonOutlineText}>Change Product</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: color }]}
                        onPress={onAddContribution}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Add Contribution</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonOutline}
                        onPress={onWithdraw}
                    >
                        <Ionicons name="wallet-outline" size={20} color="#374151" />
                        <Text style={styles.actionButtonOutlineText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

// Package Details Component
interface PackageDetailsCardProps {
    packageData: UIPackage;
    rawData: any;
}

const PackageDetailsCard: React.FC<PackageDetailsCardProps> = ({ packageData, rawData }) => {
    const [expanded, setExpanded] = useState(false);



    return (
        <View style={styles.detailsCard}>
            <TouchableOpacity
                style={styles.detailsHeader}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={styles.sectionTitle}>Package Details</Text>
                <Ionicons
                    name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
                    size={24}
                    color="#6b7280"
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.detailsContent}>
                    {/* Common Details */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Account Number</Text>
                            <Text style={styles.detailValue}>{packageData.accountNumber}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={styles.detailValue}>{packageData.status}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Start Date</Text>
                            <Text style={styles.detailValue}>{formatDate(packageData.startDate)}</Text>
                        </View>
                        {packageData.endDate && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>End Date</Text>
                                <Text style={styles.detailValue}>{formatDate(packageData.endDate)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Type-specific Details */}
                    {packageData.type === 'DS' && rawData && (
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Total Count</Text>
                                <Text style={styles.detailValue}>{rawData.totalCount || 0}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Amount Per Day</Text>
                                <Text style={styles.detailValue}>{formatCurrency(rawData.amountPerDay)}</Text>
                            </View>
                        </View>
                    )}

                    {packageData.type === 'SB' && rawData && (
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Product Name</Text>
                                <Text style={styles.detailValue}>{rawData.product?.name || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Product Price</Text>
                                <Text style={styles.detailValue}>{formatCurrency(rawData.product?.price || rawData.targetAmount)}</Text>
                            </View>
                        </View>
                    )}

                    {packageData.type === 'IBS' && rawData && (
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Principal Amount</Text>
                                <Text style={styles.detailValue}>{formatCurrency(rawData.principalAmount)}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Interest Rate</Text>
                                <Text style={styles.detailValue}>{rawData.interestRate}%</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Lock Period</Text>
                                <Text style={styles.detailValue}>{rawData.lockPeriod} days</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Interest Accrued</Text>
                                <Text style={[styles.detailValue, { color: '#10b981' }]}>
                                    {formatCurrency(rawData.interestAccrued || 0)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

// Transaction History Component
interface TransactionHistoryCardProps {
    transactions: Transaction[];
    loading: boolean;
    showAll: boolean;
    onToggleShowAll: () => void;
    packageColor: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({
    transactions,
    loading,
    showAll,
    onToggleShowAll,
    packageColor
}) => {
    const formatAmount = (transaction: Transaction): string => {
        const sign = transaction.direction === 'inflow' ? '+' : '-';
        const amount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(transaction.amount);
        return `${sign}${amount}`;
    };

    const formatDate = (dateValue: number | string): string => {
        try {
            const timestamp = typeof dateValue === 'string' ? parseInt(dateValue) : dateValue;
            if (!timestamp || timestamp === 0) return 'N/A';

            const date = new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return `Today, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
            } else if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                return date.toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const getTransactionIcon = (transaction: Transaction) => {
        if (transaction.direction === 'inflow') {
            return 'arrow-down-circle-outline';
        } else {
            return 'arrow-up-circle-outline';
        }
    };

    const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

    return (
        <View style={styles.timelineCard}>
            <View style={styles.transactionHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                {transactions.length > 5 && (
                    <TouchableOpacity onPress={onToggleShowAll}>
                        <Text style={[styles.toggleText, { color: packageColor }]}>
                            {showAll ? 'Show Less' : `View All (${transactions.length})`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={packageColor} />
                    <Text style={styles.loadingText}>Loading transactions...</Text>
                </View>
            ) : transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                    <Text style={styles.emptyText}>No transactions yet</Text>
                    <Text style={styles.emptySubtext}>
                        Your transaction history will appear here
                    </Text>
                </View>
            ) : (
                <View style={styles.transactionList}>
                    {displayTransactions.map((transaction, index) => (
                        <View
                            key={transaction.id}
                            style={[
                                styles.transactionItem,
                                index === displayTransactions.length - 1 && styles.lastTransactionItem
                            ]}
                        >
                            <View style={[
                                styles.transactionIcon,
                                { backgroundColor: `${transaction.direction === 'inflow' ? '#10b981' : '#ef4444'}20` }
                            ]}>
                                <Ionicons
                                    name={getTransactionIcon(transaction)}
                                    size={24}
                                    color={transaction.direction === 'inflow' ? '#10b981' : '#ef4444'}
                                />
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionNarration} numberOfLines={1}>
                                    {transaction.narration}
                                </Text>
                                <Text style={styles.transactionDate}>
                                    {formatDate(transaction.date)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: transaction.direction === 'inflow' ? '#10b981' : '#ef4444' }
                            ]}>
                                {formatAmount(transaction)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ef4444',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#0066A1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Overview Card
    overviewCard: {
        backgroundColor: 'white',
        margin: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    packageHeaderInfo: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    packageTitleSection: {
        alignItems: 'flex-start',
    },
    packageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    packageBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    accountNumber: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    progressCircle: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    progressCircleCenter: {
        position: 'absolute',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    progressDetails: {
        flex: 1,
    },
    progressItem: {
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    progressValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },

    // Actions Card
    actionsCard: {
        backgroundColor: 'white',
        margin: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonOutline: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: 'white',
        gap: 8,
    },
    actionButtonDanger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        gap: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonOutlineText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },

    // Details Card
    detailsCard: {
        backgroundColor: 'white',
        margin: 16,
        marginVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    detailsContent: {
        padding: 16,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
        minWidth: '45%',
    },
    detailLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },

    // Timeline Card
    timelineCard: {
        backgroundColor: 'white',
        margin: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    comingSoon: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    comingSoonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 8,
    },
    comingSoonSubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 20,
    },

    // Transaction History Styles
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    transactionList: {
        marginTop: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    lastTransactionItem: {
        borderBottomWidth: 0,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
        marginRight: 12,
    },
    transactionNarration: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
});
