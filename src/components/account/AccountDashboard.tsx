/**
 * Account Dashboard Component
 * Compact dashboard widgets for the Account/Settings screen
 * Shows balance, quick actions, and recent transactions
 */

import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery';
import { usePackagesQuery } from '@/hooks/queries/usePackagesQuery';
import { useRecentTransactions } from '@/hooks/queries/useTransactionsQuery';

export default function AccountDashboard() {
    const navigation = useNavigation();
    const { user } = useAuth();

    // Fetch data
    const {
        totalBalance,
        hasAccounts,
        isLoading: isAccountsLoading,
    } = useAccountsQuery();

    const {
        packages,
        isLoading: isPackagesLoading,
    } = usePackagesQuery();

    const {
        transactions: recentTransactions,
        isLoading: isTransactionsLoading,
    } = useRecentTransactions();

    const activePackagesCount = useMemo(
        () => packages.filter(pkg => pkg.status === 'active').length,
        [packages]
    );

    const handleViewBalance = () => {
        navigation.getParent()?.navigate('DashboardTab', {
            screen: 'Dashboard',
        });
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'deposit':
                navigation.getParent()?.navigate('PackageTab', {
                    screen: 'Deposit',
                });
                break;
            case 'withdraw':
                navigation.getParent()?.navigate('DashboardTab', {
                    screen: 'Withdraw',
                });
                break;
            case 'transfer':
                // TODO: Add transfer screen
                console.log('Transfer not implemented');
                break;
            case 'history':
                navigation.navigate('TransactionHistory' as never);
                break;
        }
    };

    const handleViewAllTransactions = () => {
        navigation.navigate('TransactionHistory' as never);
    };

    return (
        <View style={styles.container}>
            {/* Balance Overview Card */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                    <View>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        {isAccountsLoading ? (
                            <ActivityIndicator size="small" color="#0066A1" style={styles.loader} />
                        ) : (
                            <Text style={styles.balanceAmount}>
                                ₦{totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleViewBalance}
                        style={styles.viewDetailsButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#0066A1" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="wallet-outline" size={20} color="#0066A1" />
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{activePackagesCount}</Text>
                            <Text style={styles.statLabel}>Active Packages</Text>
                        </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="trending-up-outline" size={20} color="#10b981" />
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{recentTransactions.length}</Text>
                            <Text style={styles.statLabel}>Recent Transactions</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleQuickAction('deposit')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#e6f2ff' }]}>
                            <Ionicons name="add-circle-outline" size={24} color="#0066A1" />
                        </View>
                        <Text style={styles.quickActionText}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleQuickAction('withdraw')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="arrow-down-outline" size={24} color="#f59e0b" />
                        </View>
                        <Text style={styles.quickActionText}>Withdraw</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleQuickAction('transfer')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#ede9fe' }]}>
                            <Ionicons name="swap-horizontal-outline" size={24} color="#7c3aed" />
                        </View>
                        <Text style={styles.quickActionText}>Transfer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleQuickAction('history')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#ecfdf5' }]}>
                            <Ionicons name="time-outline" size={24} color="#10b981" />
                        </View>
                        <Text style={styles.quickActionText}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionsSection}>
                <View style={styles.transactionsHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity
                        onPress={handleViewAllTransactions}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {isTransactionsLoading ? (
                    <ActivityIndicator size="small" color="#0066A1" style={styles.loader} />
                ) : recentTransactions.length > 0 ? (
                    <View style={styles.transactionsList}>
                        {recentTransactions.slice(0, 3).map((transaction) => {
                            const isCredit = transaction.type === 'deposit';
                            return (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View style={styles.transactionLeft}>
                                    <View style={[
                                        styles.transactionIcon,
                                        isCredit ? styles.creditIcon : styles.debitIcon
                                    ]}>
                                        <Ionicons
                                            name={isCredit ? 'arrow-down' : 'arrow-up'}
                                            size={16}
                                            color={isCredit ? '#10b981' : '#ef4444'}
                                        />
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionTitle} numberOfLines={1}>
                                            {transaction.category || 'Transaction'}
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {transaction.date}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    isCredit ? styles.creditAmount : styles.debitAmount
                                ]}>
                                    {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                                </Text>
                            </View>
                        )})}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={32} color="#9ca3af" />
                        <Text style={styles.emptyStateText}>No recent transactions</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    // Balance Card
    balanceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066A1',
    },
    statsRow: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 16,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    // Quick Actions
    quickActionsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    // Transactions
    transactionsSection: {
        marginBottom: 24,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066A1',
    },
    transactionsList: {
        gap: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    transactionLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditIcon: {
        backgroundColor: '#ecfdf5',
    },
    debitIcon: {
        backgroundColor: '#fef2f2',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    creditAmount: {
        color: '#10b981',
    },
    debitAmount: {
        color: '#ef4444',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    },
    loader: {
        marginVertical: 16,
    },
});
