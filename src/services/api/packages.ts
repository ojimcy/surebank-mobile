/**
 * SureBank Packages API
 * 
 * Package management service methods for Daily Savings (DS),
 * Interest-Based Savings (IBS), and Savings Buying (SB) packages.
 */

import apiClient, { ApiNetworkError, apiUtils } from './client';

// Package Types
export interface DailySavingsPackage {
  id: string;
  accountNumber: string;
  amountPerDay: number;
  target: string;
  targetAmount: number;
  totalContribution: number;
  totalCount: number;
  totalCharge?: number;
  status: 'active' | 'closed' | 'pending';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SBPackage {
  _id: string;
  accountNumber: string;
  targetAmount: number;
  totalContribution: number;
  status: 'active' | 'closed' | 'pending';
  startDate: string;
  endDate?: string;
  product?: {
    name: string;
    images?: string[];
    price?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IBPackage {
  _id: string;
  id?: string;
  name: string;
  userId: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  compoundingFrequency: string;
  status: 'active' | 'matured' | 'pending';
  maturityDate: string;
  interestAccrued: number;
  currentBalance: number;
  accountNumber?: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

// Unified Package Interface for UI
export interface UIPackage {
  id: string;
  title: string;
  type: 'DS' | 'IBS' | 'SB';
  typeLabel: 'Daily Savings' | 'Interest-Based' | 'SB Package';
  icon: string;
  progress: number;
  current: number;
  target: number;
  color: string;
  statusColor: string;
  status: string;
  accountNumber: string;
  lastContribution?: string;
  nextContribution?: string;
  interestRate?: string;
  maturityDate?: string;
  productImage?: string;
  startDate: string;
  endDate?: string;
  amountPerDay?: number;
  totalCount?: number;
}

// Package Type Definitions
export interface PackageType {
  id: 'ds' | 'ibs' | 'sb';
  title: string;
  description: string;
  icon: string;
  color: string;
  cta: string;
  features: string[];
}

// API Request/Response Types
export interface CreateDailySavingsPackageParams {
  amountPerDay: number;
  target: string;
}

export interface CreateSBPackageParams {
  product: string;
  targetAmount?: number;
}

export interface InitiateIBPackageParams {
  name: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  compoundingFrequency?: string;
}

export interface CreateIBPackageParams extends InitiateIBPackageParams {
  paymentReference: string;
}

export interface InitiateIBPackageResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
}

export interface InitializeContributionParams {
  packageId?: string;
  amount: number;
  contributionType: 'daily_savings' | 'savings_buying' | 'interest_package';
  redirect_url?: string;
  callbackUrl?: string;
  name?: string;
  principalAmount?: number;
  interestRate?: number;
  lockPeriod?: number;
  compoundingFrequency?: string;
}

export interface InitializeContributionResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
}

export interface GetAllPackagesResponse {
  dailySavings: DailySavingsPackage[];
  sbPackages: SBPackage[];
  ibPackages: IBPackage[];
}

// Package API Service
export class PackagesService {
  /**
   * Get all packages for a user
   */
  async getAllPackages(userId: string): Promise<GetAllPackagesResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get<GetAllPackagesResponse>(`/packages/user/${userId}`),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  }

  /**
   * Check if user has required account type
   */
  async checkAccountType(accountType: 'ds' | 'sb' | 'ibs'): Promise<boolean> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get<{ hasAccount: boolean }>(`/accounts/check/${accountType}`),
        2,
        1000
      );
      return response.data.hasAccount;
    } catch (error) {
      console.error('Failed to check account type:', error);
      return false;
    }
  }

  /**
   * Create Daily Savings Package
   */
  async createDailySavingsPackage(params: CreateDailySavingsPackageParams): Promise<DailySavingsPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<DailySavingsPackage>('/packages/daily-savings', params),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create daily savings package:', error);
      throw error;
    }
  }

  /**
   * Create SB Package
   */
  async createSBPackage(params: CreateSBPackageParams): Promise<SBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<SBPackage>('/packages/sb', params),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create SB package:', error);
      throw error;
    }
  }

  /**
   * Initiate IB Package (returns payment details)
   */
  async initiateIBPackage(params: InitiateIBPackageParams): Promise<InitiateIBPackageResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<InitiateIBPackageResponse>('/packages/ib/initiate', params),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to initiate IB package:', error);
      throw error;
    }
  }

  /**
   * Create IB Package (after payment)
   */
  async createIBPackage(params: CreateIBPackageParams): Promise<IBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<IBPackage>('/packages/ib', params),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create IB package:', error);
      throw error;
    }
  }

  /**
   * Initialize contribution/deposit
   */
  async initializeContribution(params: InitializeContributionParams): Promise<InitializeContributionResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<InitializeContributionResponse>('/contributions/initialize', params),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to initialize contribution:', error);
      throw error;
    }
  }

  /**
   * Get package details by ID and type
   */
  async getPackageDetails(packageId: string, type: 'ds' | 'sb' | 'ib'): Promise<DailySavingsPackage | SBPackage | IBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get(`/packages/${type}/${packageId}`),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get package details:', error);
      throw error;
    }
  }

  /**
   * Transform API packages to UI format
   */
  transformToUIPackages(apiData: GetAllPackagesResponse): UIPackage[] {
    const packages: UIPackage[] = [];

    // Transform Daily Savings packages
    apiData.dailySavings.forEach(pkg => {
      packages.push({
        id: pkg.id,
        title: pkg.target,
        type: 'DS',
        typeLabel: 'Daily Savings',
        icon: 'calendar-outline',
        progress: pkg.targetAmount > 0 ? (pkg.totalContribution / pkg.targetAmount) * 100 : 0,
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        color: '#0066A1',
        statusColor: pkg.status === 'active' ? '#10b981' : pkg.status === 'closed' ? '#6b7280' : '#f59e0b',
        status: pkg.status,
        accountNumber: pkg.accountNumber,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        amountPerDay: pkg.amountPerDay,
        totalCount: pkg.totalCount,
      });
    });

    // Transform SB packages
    apiData.sbPackages.forEach(pkg => {
      packages.push({
        id: pkg._id,
        title: pkg.product?.name || 'SB Package',
        type: 'SB',
        typeLabel: 'SB Package',
        icon: 'bag-outline',
        progress: pkg.targetAmount > 0 ? (pkg.totalContribution / pkg.targetAmount) * 100 : 0,
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        color: '#7952B3',
        statusColor: pkg.status === 'active' ? '#10b981' : pkg.status === 'closed' ? '#6b7280' : '#f59e0b',
        status: pkg.status,
        accountNumber: pkg.accountNumber,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        productImage: pkg.product?.images?.[0],
      });
    });

    // Transform IB packages
    apiData.ibPackages.forEach(pkg => {
      packages.push({
        id: pkg._id || pkg.id!,
        title: pkg.name,
        type: 'IBS',
        typeLabel: 'Interest-Based',
        icon: 'trending-up-outline',
        progress: 100, // IB packages are fully funded upfront
        current: pkg.currentBalance || pkg.principalAmount,
        target: pkg.principalAmount,
        color: '#28A745',
        statusColor: pkg.status === 'active' ? '#10b981' : pkg.status === 'matured' ? '#0066A1' : '#f59e0b',
        status: pkg.status,
        accountNumber: pkg.accountNumber || 'N/A',
        startDate: pkg.startDate || pkg.createdAt,
        maturityDate: pkg.maturityDate,
        interestRate: `${pkg.interestRate}%`,
      });
    });

    return packages.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }
}

// Export singleton instance
const packagesService = new PackagesService();
export default packagesService;