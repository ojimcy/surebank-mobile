import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainHeader } from '@/components/navigation';
import {
  BalanceCard,
  QuickActions,
  RecentTransactions,
  Announcements,
  SavingsPackages,
  PackageTypes,
} from '@/components/dashboard';
import type { DashboardScreenProps } from '@/navigation/types';
import type {
  Account,
  SavingsPackage,
  PackageType,
  Transaction,
  Announcement,
} from '@/components/dashboard/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery';
import { usePackagesQuery } from '@/hooks/queries/usePackagesQuery';
import { useRecentTransactions } from '@/hooks/queries/useTransactionsQuery';

export default function DashboardScreen({ navigation }: DashboardScreenProps<'Dashboard'>) {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from API
  const {
    accounts,
    totalBalance,
    hasAccounts,
    isLoading: isAccountsLoading,
    refetchAccounts,
    createAccount,
    isCreatingAccount,
  } = useAccountsQuery();

  const {
    packages,
    isLoading: isPackagesLoading,
    hasPackages,
    refetchPackages,
  } = usePackagesQuery();

  const {
    transactions: recentTransactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useRecentTransactions();

  // Loading states
  const isLoading = {
    accounts: isAccountsLoading,
    packages: isPackagesLoading,
    transactions: isTransactionsLoading,
    balance: isAccountsLoading,
  };

  // Transform accounts for UI display
  const displayAccounts: Account[] = accounts.map(account => ({
    id: account._id,
    accountType: account.accountType,
    balance: account.availableBalance,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }));

  // Active packages for display
  const activePackages = packages.filter(pkg => pkg.status === 'active');

  // Announcements based on real user data
  const announcements: Announcement[] = useMemo(() => {
    if (!user) return [];

    const announcements: Announcement[] = [];

    // Email verification announcement
    if (!user.isEmailVerified) {
      announcements.push({
        id: 'verify-email',
        title: 'Verify Your Email Address',
        description: 'Please complete your email verification to unlock all features.',
        type: 'warning',
        priority: 'high',
        dismissible: true,
        cta: {
          text: 'Verify Now',
          action: () => {
            // TODO: Navigate to email verification
            console.log('Navigate to email verification');
          },
        },
        condition: (user: any) => !user.isEmailVerified,
        createdAt: '2024-01-20T10:00:00Z',
      });
    }

    // KYC verification announcement
    if (user.kycStatus !== 'verified') {
      announcements.push({
        id: 'complete-kyc',
        title: 'Complete Your KYC Verification',
        description: 'Complete your KYC verification to unlock all features and increase your transaction limits.',
        type: 'info',
        priority: 'medium',
        dismissible: true,
        cta: {
          text: 'Complete KYC',
          action: () => {
            // TODO: Navigate to KYC verification
            console.log('Navigate to KYC verification');
          },
        },
        condition: (user: any) => user.kycStatus !== 'verified',
        createdAt: '2024-01-19T09:00:00Z',
      });
    }

    return announcements;
  }, [user]);

  // Available package types
  const packageTypes: PackageType[] = useMemo(
    () => [
      {
        id: 'ds',
        title: 'DS',
        description: 'Save regularly with flexible daily, weekly, or monthly deposits',
        icon: 'calendar',
        color: '#0066A1',
        cta: 'Start Saving',
        path: '/packages/new?type=daily',
        features: {
          minimum: '₦1,000',
          frequency: 'Daily/Weekly/Monthly',
        },
      },
      {
        id: 'ibs',
        title: 'IBS',
        description: 'Earn competitive interest rates on your locked savings',
        icon: 'trending-up',
        color: '#28A745',
        cta: 'Lock Funds',
        path: '/packages/new?type=interest',
        features: {
          interestRate: '8-12% p.a.',
          lockPeriod: '3-12 months',
        },
      },
      {
        id: 'sb',
        title: 'SB',
        description: 'Save towards specific products with SureBank packages',
        icon: 'target',
        color: '#7952B3',
        cta: 'Choose Product',
        path: '/packages/new?type=product',
        features: {
          products: 'Electronics, Appliances',
          paymentPlan: 'Flexible',
        },
      },
    ],
    []
  );


  // Event handlers
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleAvatarPress = () => {
    // TODO: Navigate to profile or show user menu
    console.log('Avatar pressed');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh all data
      await Promise.all([
        refetchAccounts(),
        refetchPackages(),
        refetchTransactions(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAccounts, refetchPackages, refetchTransactions]);

  const handleCreateAccount = useCallback((type: 'ds' | 'sb' | 'ibs') => {
    createAccount(type);
  }, [createAccount]);

  const handleRefreshBalance = useCallback(() => {
    refetchAccounts();
  }, [refetchAccounts]);

  // Quick Actions handlers
  const handleNewPackage = () => {
    // TODO: Navigate to package creation
    console.log('Navigate to new package');
  };

  const handleDeposit = () => {
    // TODO: Navigate to deposit screen
    console.log('Navigate to deposit');
  };

  const handleWithdraw = () => {
    // TODO: Navigate to withdraw screen
    console.log('Navigate to withdraw');
  };

  const handleMyCards = () => {
    // TODO: Navigate to cards screen
    console.log('Navigate to cards');
  };

  const handleSchedules = () => {
    // TODO: Navigate to schedules screen
    console.log('Navigate to schedules');
  };

  // Savings handlers
  const handleViewAllPackages = () => {
    // TODO: Navigate to packages screen when available
    console.log('Navigate to all packages');
  };

  const handleCreateNewPackage = () => {
    // TODO: Navigate to package creation
    console.log('Navigate to create new package');
  };

  const handlePackagePress = (packageId: string) => {
    // TODO: Navigate to package details
    console.log('Navigate to package:', packageId);
  };

  const handlePackageDeposit = (packageId: string) => {
    // TODO: Navigate to deposit for specific package
    console.log('Deposit to package:', packageId);
  };

  const handlePackageTypePress = (type: PackageType) => {
    // TODO: Navigate to package creation with pre-selected type
    console.log('Create package of type:', type.id);
  };

  const handleViewAllSavingsPlans = () => {
    // TODO: Navigate to all savings plans when available
    console.log('Navigate to all savings plans');
  };

  // Transactions handlers
  const handleViewAllTransactions = () => {
    // TODO: Navigate to transaction history
    console.log('Navigate to transaction history');
  };

  const handleTransactionPress = (transactionId: string) => {
    // TODO: Navigate to transaction details
    console.log('Navigate to transaction:', transactionId);
  };

  // Announcements handlers
  const handleAnnouncementDismiss = (announcementId: string) => {
    // TODO: Dismiss announcement
    console.log('Dismiss announcement:', announcementId);
  };

  const handleAnnouncementPress = (announcement: Announcement) => {
    if (announcement.cta) {
      announcement.cta.action();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <MainHeader
        onNotificationPress={handleNotificationPress}
        onAvatarPress={handleAvatarPress}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <BalanceCard
          balance={totalBalance}
          showBalance={showBalance}
          setShowBalance={setShowBalance}
          hasAccounts={hasAccounts}
          isAccountsLoading={isLoading.accounts || isCreatingAccount}
          accounts={displayAccounts}
          onCreateAccount={handleCreateAccount}
          onRefreshBalance={handleRefreshBalance}
        />

        {/* Announcements */}
        {announcements.length > 0 && (
          <Announcements
            announcements={announcements}
            onDismiss={handleAnnouncementDismiss}
            onAnnouncementPress={handleAnnouncementPress}
          />
        )}

        {/* Quick Actions */}
        <QuickActions
          onNewPackage={handleNewPackage}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onMyCards={handleMyCards}
          onSchedules={handleSchedules}
        />

        {/* Conditional Savings Display */}
        {isLoading.packages ? (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#212529', marginBottom: 16 }}>
              My Savings
            </Text>
            {/* TODO: Add loading skeleton */}
          </View>
        ) : activePackages.length > 0 ? (
          <SavingsPackages
            packages={activePackages}
            isLoading={isLoading.packages}
            onViewAll={handleViewAllPackages}
            onCreateNew={handleCreateNewPackage}
            onPackagePress={handlePackagePress}
            onDeposit={handlePackageDeposit}
          />
        ) : (
          <PackageTypes
            packageTypes={packageTypes}
            onPackageTypePress={handlePackageTypePress}
            onViewAll={handleViewAllSavingsPlans}
          />
        )}

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={isLoading.transactions}
          onViewAll={handleViewAllTransactions}
          onTransactionPress={handleTransactionPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}