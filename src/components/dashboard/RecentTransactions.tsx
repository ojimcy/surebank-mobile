/**
 * Recent Transactions Component
 * Display latest transactions with navigation to details
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RecentTransactionsProps } from './types';

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const formatTime = (timeString: string): string => {
    try {
        // If timeString is already formatted, return as is
        if (timeString.includes(':')) {
            return timeString;
        }
        // Otherwise, try to parse as date and format time
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return timeString;
    }
};

const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
        {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonLeft}>
                    <View style={styles.skeletonIcon} />
                    <View style={styles.skeletonTextContainer}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonSubtitle} />
                    </View>
                </View>
                <View style={styles.skeletonRight}>
                    <View style={styles.skeletonAmount} />
                    <View style={styles.skeletonDate} />
                </View>
            </View>
        ))}
    </View>
);

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptySubtitle}>
            Your recent transactions will appear here
        </Text>
    </View>
);

export default function RecentTransactions({
    transactions,
    isLoading,
    onViewAll,
    onTransactionPress,
}: RecentTransactionsProps) {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Transactions</Text>
                </View>
                <LoadingSkeleton />
            </View>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Transactions</Text>
                </View>
                <EmptyState />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Transactions</Text>
                <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward-outline" size={16} color="#0066A1" />
                </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
                {transactions.slice(0, 5).map((transaction) => (
                    <TouchableOpacity
                        key={transaction.id}
                        style={styles.transactionItem}
                        onPress={() => onTransactionPress(transaction.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.transactionLeft}>
                            <View
                                style={[
                                    styles.transactionIcon,
                                    transaction.type === 'deposit'
                                        ? styles.depositIcon
                                        : styles.withdrawalIcon,
                                ]}
                            >
                                <Ionicons
                                    name={
                                        transaction.type === 'deposit'
                                            ? 'arrow-down-outline'
                                            : 'arrow-up-outline'
                                    }
                                    size={20}
                                    color={transaction.type === 'deposit' ? '#28A745' : '#DC3545'}
                                />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionType}>
                                    {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                </Text>
                                <Text style={styles.transactionCategory}>
                                    {transaction.category}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.transactionRight}>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    transaction.type === 'deposit'
                                        ? styles.positiveAmount
                                        : styles.negativeAmount,
                                ]}
                            >
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                            </Text>
                            <Text style={styles.transactionDateTime}>
                                {formatDate(transaction.date)}, {formatTime(transaction.time)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        color: '#0066A1',
        fontWeight: '500',
    },
    transactionsList: {
        gap: 12,
    },
    transactionItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    depositIcon: {
        backgroundColor: '#E8F5E8',
    },
    withdrawalIcon: {
        backgroundColor: '#FFF0F0',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionType: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 12,
        color: '#6c757d',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    positiveAmount: {
        color: '#28A745',
    },
    negativeAmount: {
        color: '#DC3545',
    },
    transactionDateTime: {
        fontSize: 12,
        color: '#6c757d',
    },
    // Loading skeleton styles
    skeletonContainer: {
        gap: 12,
    },
    skeletonItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skeletonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    skeletonIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
    },
    skeletonTextContainer: {
        flex: 1,
    },
    skeletonTitle: {
        height: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        marginBottom: 6,
        width: '60%',
    },
    skeletonSubtitle: {
        height: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        width: '40%',
    },
    skeletonRight: {
        alignItems: 'flex-end',
    },
    skeletonAmount: {
        height: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        width: 80,
        marginBottom: 6,
    },
    skeletonDate: {
        height: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        width: 60,
    },
    // Empty state styles
    emptyContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});
