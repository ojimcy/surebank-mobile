/**
 * Dashboard Component Types
 * Type definitions for all dashboard-related components and data structures
 */

export interface Account {
    id: string;
    accountType: 'ds' | 'sb' | 'ibs';
    balance: number;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

export interface SavingsPackage {
    id: string;
    title: string;
    type: 'ds' | 'sb' | 'ibs';
    icon: string;
    progress: number;
    current: number;
    target: number;
    amountPerDay?: number;
    totalContribution: number;
    color: string;
    status: 'active' | 'closed' | 'pending';
    totalCount?: number; // For DS packages validation
    createdAt: string;
    updatedAt: string;
}

export interface PackageType {
    id: 'ds' | 'sb' | 'ibs';
    title: string;
    description: string;
    icon: string;
    color: string;
    cta: string;
    path: string;
    features: {
        minimum?: string;
        frequency?: string;
        interestRate?: string;
        lockPeriod?: string;
        products?: string;
        paymentPlan?: string;
    };
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'other';
    category: string;
    amount: number;
    date: string;
    time: string;
    status: 'completed' | 'pending' | 'failed';
    description?: string;
    reference?: string;
}

export interface Announcement {
    id: string;
    title: string;
    description: string;
    type: 'info' | 'warning' | 'success' | 'error';
    priority: 'low' | 'medium' | 'high';
    dismissible: boolean;
    cta?: {
        text: string;
        action: () => void;
    };
    condition: (user: any) => boolean;
    createdAt: string;
    expiresAt?: string;
}

export interface BalanceCardProps {
    balance: number;
    showBalance: boolean;
    setShowBalance: (show: boolean) => void;
    hasAccounts: boolean;
    isAccountsLoading: boolean;
    accounts: Account[];
    onCreateAccount: (type: 'ds' | 'sb' | 'ibs') => void;
    onRefreshBalance: () => void;
    isCreateAccountLoading?: boolean;
}

export interface QuickActionsProps {
    onNewPackage: () => void;
    onDeposit: () => void;
    onWithdraw: () => void;
    onMyCards: () => void;
    onSchedules: () => void;
}

export interface SavingsPackagesProps {
    packages: SavingsPackage[];
    isLoading: boolean;
    onViewAll: () => void;
    onCreateNew: () => void;
    onPackagePress: (packageId: string) => void;
    onDeposit: (packageId: string) => void;
}

export interface PackageTypesProps {
    packageTypes: PackageType[];
    onPackageTypePress: (type: PackageType) => void;
    onViewAll: () => void;
}

export interface RecentTransactionsProps {
    transactions: Transaction[];
    isLoading: boolean;
    onViewAll: () => void;
    onTransactionPress: (transactionId: string) => void;
}

export interface AnnouncementsProps {
    announcements: Announcement[];
    onDismiss: (announcementId: string) => void;
    onAnnouncementPress: (announcement: Announcement) => void;
}

// Utility types for formatting
export interface CurrencyFormatter {
    (amount: number): string;
}

export interface DateFormatter {
    (date: string): string;
}

// Dashboard state types
export interface DashboardState {
    user: any; // Will be replaced with proper User type
    accounts: Account[];
    balance: number;
    packages: SavingsPackage[];
    transactions: Transaction[];
    announcements: Announcement[];
    isLoading: {
        accounts: boolean;
        packages: boolean;
        transactions: boolean;
        balance: boolean;
    };
    showBalance: boolean;
}
