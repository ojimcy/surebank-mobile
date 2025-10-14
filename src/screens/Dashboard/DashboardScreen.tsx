import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
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
import type { DashboardScreenProps, PackageStackParamList } from '@/navigation/types';
import type {
  Account,
  PackageType,
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
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

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

  // Navigate to KYC from announcements
  const navigateToKYC = useCallback(() => {
    navigation.getParent()?.navigate('SettingsTab', {
      screen: 'KYCVerification'
    });
  }, [navigation]);

  // Announcements based on real user data
  const announcements: Announcement[] = useMemo(() => {
    if (!user) return [];

    const announcements: Announcement[] = [];

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
          action: navigateToKYC,
        },
        condition: (user: any) => user.kycStatus !== 'verified',
        createdAt: '2024-01-19T09:00:00Z',
      });
    }

    // Filter out dismissed announcements
    return announcements.filter(a => !dismissedAnnouncements.includes(a.id));
  }, [user, dismissedAnnouncements, navigateToKYC]);

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
    // Navigate to Notifications screen within Dashboard stack
    navigation.navigate('Notifications');
  };

  const handleAvatarPress = () => {
    // Navigate to Personal Information (Profile) screen in Settings tab
    navigation.getParent()?.navigate('SettingsTab', {
      screen: 'PersonalInformation'
    });
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
    // Check if user has completed KYC
    if (user?.kycStatus !== 'verified') {
      // Navigate to KYC verification screen in Settings tab
      navigation.getParent()?.navigate('SettingsTab', {
        screen: 'KYCVerification'
      });
      return;
    }

    // If KYC is verified, create the account
    createAccount(type);
  }, [createAccount, user?.kycStatus, navigation]);

  const handleRefreshBalance = useCallback(() => {
    refetchAccounts();
  }, [refetchAccounts]);

  // Quick Actions handlers
  const handleNewPackage = () => {
    // Navigate to Package tab, then to NewPackage screen
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'NewPackage'
    });
  };

  const handleDeposit = () => {
    // Navigate to Package tab, then to Deposit screen
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'Deposit'
    });
  };

  const handleWithdraw = () => {
    // Navigate to Package tab for withdraw
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'Withdraw',
    });
  };

  const handleMyCards = () => {
    // Navigate to Payment Methods in Settings tab
    navigation.getParent()?.navigate('SettingsTab', {
      screen: 'PaymentMethods'
    });
  };

  const handleSchedules = () => {
    // Navigate to SchedulesList screen in Dashboard stack
    navigation.navigate('SchedulesList');
  };

  // Savings handlers
  const handleViewAllPackages = () => {
    // Navigate to Package tab home
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'PackageHome'
    });
  };

  const handleCreateNewPackage = () => {
    // Navigate to Package tab, then to NewPackage screen
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'NewPackage'
    });
  };

  const handlePackagePress = (packageId: string) => {
    // Navigate to Package tab, then to PackageDetail screen
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'PackageDetail',
      params: { packageId, packageType: 'DS' } // Default to DS, will be determined by actual package
    });
  };

  const handlePackageDeposit = (packageId: string) => {
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'Deposit',
      params: { packageId },
    });
  };

  const handlePackageTypePress = (type: PackageType) => {
    // For SB packages, navigate to ProductsTab to browse products
    if (type.id === 'sb') {
      navigation.getParent()?.navigate('ProductsTab', {
        screen: 'ProductsHome'
      });
      return;
    }

    // Navigate directly to specific package creation based on type
    const screenMap: { [key: string]: keyof PackageStackParamList } = {
      'ds': 'CreateDailySavings',
      'ibs': 'CreateIBSPackage',
    };

    navigation.getParent()?.navigate('PackageTab', {
      screen: screenMap[type.id] || 'NewPackage'
    });
  };

  const handleViewAllSavingsPlans = () => {
    // Navigate to Package tab, then to NewPackage screen
    navigation.getParent()?.navigate('PackageTab', {
      screen: 'NewPackage'
    });
  };

  // Transactions handlers
  const handleViewAllTransactions = () => {
    // Navigate to TransactionHistory screen within Settings stack
    navigation.navigate('TransactionHistory');
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('TransactionDetail', { transactionId });
  };

  // Announcements handlers
  const handleAnnouncementDismiss = useCallback((announcementId: string) => {
    setDismissedAnnouncements(prev => [...prev, announcementId]);
  }, []);

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
          userKycStatus={user?.kycStatus}
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
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120
            }}>
              <ActivityIndicator size="large" color="#0066A1" />
              <Text style={{ marginTop: 12, color: '#6c757d', fontSize: 14 }}>
                Loading your savings...
              </Text>
            </View>
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