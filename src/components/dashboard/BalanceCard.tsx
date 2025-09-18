/**
 * Balance Card Component
 * Enhanced professional balance card with modern banking app design
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { BalanceCardProps } from './types';

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const getAccountTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
        ds: 'DS',
        sb: 'SB',
        ibs: 'IBS',
    };
    return typeMap[type] || type.toUpperCase();
};

export default function BalanceCard({
    balance,
    showBalance,
    setShowBalance,
    hasAccounts,
    isAccountsLoading,
    accounts,
    onCreateAccount,
    onRefreshBalance,
    isCreateAccountLoading = false,
}: BalanceCardProps) {
    const [showAccountLinks, setShowAccountLinks] = useState(false);

    // Get unique account types from accounts array
    const accountTypes = accounts
        ? [...new Set(accounts.map((account) => account.accountType))]
        : [];

    return (
        <View style={styles.container}>
            {/* Main Balance Card */}
            <LinearGradient
                colors={['#0066A1', '#0077B5', '#0088CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainCard}
            >
                {/* Decorative Elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />

                <View style={styles.cardContent}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>Available Balance</Text>
                            <View style={styles.controls}>
                                {hasAccounts && (
                                    <TouchableOpacity
                                        onPress={() => setShowBalance(!showBalance)}
                                        style={styles.controlButton}
                                        accessibilityLabel={showBalance ? 'Hide balance' : 'Show balance'}
                                    >
                                        <Ionicons
                                            name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                                            size={18}
                                            color="rgba(255, 255, 255, 0.9)"
                                        />
                                    </TouchableOpacity>
                                )}
                                {hasAccounts && (
                                    <TouchableOpacity
                                        onPress={onRefreshBalance}
                                        disabled={isAccountsLoading}
                                        style={[
                                            styles.controlButton,
                                            isAccountsLoading && styles.controlButtonDisabled,
                                        ]}
                                        accessibilityLabel="Refresh balance"
                                    >
                                        <Ionicons
                                            name="refresh-outline"
                                            size={18}
                                            color="rgba(255, 255, 255, 0.9)"
                                            style={[
                                                isAccountsLoading && styles.spinningIcon,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Card Icon */}
                        <View style={styles.cardIconContainer}>
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                                style={styles.cardIcon}
                            >
                                <Ionicons name="card-outline" size={24} color="#ffffff" />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Balance Section */}
                    <View style={styles.balanceSection}>
                        {isAccountsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#ffffff" />
                                <Text style={styles.loadingText}>Loading balance...</Text>
                            </View>
                        ) : hasAccounts ? (
                            <>
                                <Text style={styles.balance}>
                                    {showBalance ? formatCurrency(balance) : '••••••••'}
                                </Text>
                                <Text style={styles.balanceSubtext}>
                                    {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} • Last updated now
                                </Text>
                            </>
                        ) : (
                            <View style={styles.noAccountsContainer}>
                                <Text style={styles.noAccountsText}>Ready to start saving?</Text>
                                <Text style={styles.noAccountsSubtext}>Create your first account to begin</Text>
                            </View>
                        )}
                    </View>

                    {/* Account Links Section */}
                    {hasAccounts && accountTypes.length > 0 && (
                        <View style={styles.accountLinksSection}>
                            <TouchableOpacity
                                onPress={() => setShowAccountLinks(!showAccountLinks)}
                                style={styles.viewAccountsButton}
                            >
                                <Text style={styles.viewAccountsText}>View accounts</Text>
                                <Ionicons
                                    name="chevron-down-outline"
                                    size={16}
                                    color="rgba(255, 255, 255, 0.8)"
                                    style={[
                                        styles.chevronIcon,
                                        showAccountLinks && styles.chevronIconRotated,
                                    ]}
                                />
                            </TouchableOpacity>

                            {showAccountLinks && (
                                <View style={styles.accountLinksGrid}>
                                    {accountTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={styles.accountTypeButton}
                                            onPress={() => {
                                                console.log(`Navigate to ${type} account`);
                                            }}
                                        >
                                            <Text style={styles.accountTypeText}>
                                                {getAccountTypeName(type)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        onPress={() => {
                                            console.log('Show account type selection');
                                        }}
                                        style={styles.addAccountButton}
                                    >
                                        <Ionicons name="add" size={16} color="#0066A1" />
                                        <Text style={styles.addAccountText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Create Account CTA - Only show if no accounts exist */}
            {!hasAccounts && !isAccountsLoading && (
                <View style={styles.createAccountSection}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Show account type selection for new account');
                        }}
                        disabled={isCreateAccountLoading}
                        style={[
                            styles.createAccountButton,
                            isCreateAccountLoading && styles.createAccountButtonDisabled,
                        ]}
                    >
                        {isCreateAccountLoading ? (
                            <>
                                <ActivityIndicator size="small" color="#0066A1" />
                                <Text style={styles.createAccountText}>Creating account...</Text>
                            </>
                        ) : (
                            <>
                                <LinearGradient
                                    colors={['#0066A1', '#0077B5']}
                                    style={styles.createButtonIcon}
                                >
                                    <Ionicons name="add-outline" size={20} color="#ffffff" />
                                </LinearGradient>
                                <View style={styles.createButtonTextContainer}>
                                    <Text style={styles.createAccountText}>Create Your First Account</Text>
                                    <Text style={styles.createAccountSubtext}>Start your savings journey today</Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={20} color="#0066A1" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
    },
    mainCard: {
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    // Decorative Elements
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    decorativeCircle2: {
        position: 'absolute',
        top: 20,
        right: -60,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeCircle3: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    cardContent: {
        position: 'relative',
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    controls: {
        flexDirection: 'row',
        gap: 12,
    },
    controlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    controlButtonDisabled: {
        opacity: 0.5,
    },
    spinningIcon: {
        // Add rotation animation if needed
    },
    cardIconContainer: {
        marginLeft: 16,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    balanceSection: {
        marginBottom: 20,
    },
    balance: {
        fontSize: 36,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
        letterSpacing: -1,
    },
    balanceSubtext: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    loadingText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        fontWeight: '500',
    },
    noAccountsContainer: {
        paddingVertical: 8,
    },
    noAccountsText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    noAccountsSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    accountLinksSection: {
        marginTop: 8,
    },
    viewAccountsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 6,
    },
    viewAccountsText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    chevronIcon: {
        transform: [{ rotate: '0deg' }],
    },
    chevronIconRotated: {
        transform: [{ rotate: '180deg' }],
    },
    accountLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
    },
    accountTypeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    accountTypeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
    },
    addAccountButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addAccountText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0066A1',
    },
    // Create Account Section (for users with no accounts)
    createAccountSection: {
        marginTop: 16,
    },
    createAccountButton: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
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
    createAccountButtonDisabled: {
        opacity: 0.7,
    },
    createButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    createButtonTextContainer: {
        flex: 1,
    },
    createAccountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 2,
    },
    createAccountSubtext: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
});
