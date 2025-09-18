import React, { useState, useMemo } from 'react';
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

export default function DashboardScreen({ navigation }: DashboardScreenProps<'Dashboard'>) {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const [isLoading, setIsLoading] = useState({
    accounts: false,
    packages: false,
    transactions: false,
    balance: false,
  });

  // Mock accounts data
  const mockAccounts: Account[] = [
    {
      id: '1',
      accountType: 'ds',
      balance: 150000,
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
    },
    {
      id: '2',
      accountType: 'ibs',
      balance: 500000,
      status: 'active',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-20T12:00:00Z',
    },
  ];

  // Mock packages data
  const mockPackages: SavingsPackage[] = [
    {
      id: '1',
      title: 'Emergency Fund',
      type: 'ds',
      icon: 'home',
      progress: 65,
      current: 325000,
      target: 500000,
      amountPerDay: 5000,
      totalContribution: 325000,
      color: '#0066A1',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
    },
    {
      id: '2',
      title: 'Laptop Fund',
      type: 'sb',
      icon: 'laptop',
      progress: 40,
      current: 200000,
      target: 500000,
      totalContribution: 200000,
      color: '#7952B3',
      status: 'active',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
    },
  ];

  // Mock transactions data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      category: 'Emergency Fund',
      amount: 5000,
      date: '2024-01-20',
      time: '15:30',
      status: 'completed',
      description: 'Daily savings deposit',
    },
    {
      id: '2',
      type: 'deposit',
      category: 'Laptop Fund',
      amount: 10000,
      date: '2024-01-18',
      time: '14:20',
      status: 'completed',
      description: 'Weekly contribution',
    },
    {
      id: '3',
      type: 'withdrawal',
      category: 'Emergency Fund',
      amount: 2000,
      date: '2024-01-17',
      time: '10:15',
      status: 'completed',
      description: 'Emergency withdrawal',
    },
  ];

  // Mock announcements data
  const mockAnnouncements: Announcement[] = useMemo(() => {
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

  // Calculate total balance
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const hasAccounts = mockAccounts.length > 0;
  const activePackages = mockPackages.filter(pkg => pkg.status === 'active');

  // Event handlers
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleAvatarPress = () => {
    // TODO: Navigate to profile or show user menu
    console.log('Avatar pressed');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCreateAccount = (type: 'ds' | 'sb' | 'ibs') => {
    // TODO: Implement account creation
    console.log('Create account:', type);
  };

  const handleRefreshBalance = () => {
    // TODO: Implement balance refresh
    console.log('Refresh balance');
  };

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
          isAccountsLoading={isLoading.accounts}
          accounts={mockAccounts}
          onCreateAccount={handleCreateAccount}
          onRefreshBalance={handleRefreshBalance}
        />

        {/* Announcements */}
        {mockAnnouncements.length > 0 && (
          <Announcements
            announcements={mockAnnouncements}
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
          transactions={mockTransactions}
          isLoading={isLoading.transactions}
          onViewAll={handleViewAllTransactions}
          onTransactionPress={handleTransactionPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}