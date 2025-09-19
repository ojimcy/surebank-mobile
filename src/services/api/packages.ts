/**
 * Packages API Service
 *
 * Handles all package-related API operations including
 * daily savings, SureBank packages, and interest-based packages.
 */

import apiClient from './client';

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
  status: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
}

export interface SBPackage {
  _id: string;
  accountNumber: string;
  targetAmount: number;
  totalContribution: number;
  status: string;
  startDate: string;
  endDate?: string;
  product?: {
    name: string;
    images?: string[];
  };
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
  status: string;
  maturityDate: string;
  interestAccrued: number;
  createdAt: string;
  updatedAt: string;
  accountNumber?: string;
  targetAmount?: number;
  totalContribution?: number;
  startDate?: string;
  endDate?: string;
  currentBalance?: number;
}

// Package creation interfaces
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

// Combined packages response
export interface AllPackagesResponse {
  dailySavings: DailySavingsPackage[];
  sbPackages: SBPackage[];
  ibPackages: IBPackage[];
}

// API Functions
const packagesApi = {
  /**
   * Get daily savings packages for the authenticated user
   * Note: The API should extract userId from the JWT token
   */
  async getDailySavings(): Promise<DailySavingsPackage[]> {
    try {
      const response = await apiClient.get<DailySavingsPackage[]>('/daily-savings/self-packages');
      return response.data;
    } catch (error) {
      // If self endpoint doesn't exist, return empty array
      console.warn('Daily savings self endpoint not available, returning empty array');
      return [];
    }
  },

  /**
   * Get SureBank packages for the authenticated user
   * Note: The API should extract userId from the JWT token
   */
  async getSBPackages(): Promise<SBPackage[]> {
    try {
      const response = await apiClient.get<SBPackage[]>('/daily-savings/sb/self-packages');
      return response.data;
    } catch (error) {
      // If self endpoint doesn't exist, return empty array
      console.warn('SB packages self endpoint not available, returning empty array');
      return [];
    }
  },

  /**
   * Get Interest-Based packages for the authenticated user
   */
  async getIBPackages(): Promise<IBPackage[]> {
    try {
      const response = await apiClient.get<IBPackage[]>('/interest-savings/package');
      return response.data;
    } catch (error) {
      console.warn('IB packages endpoint not available, returning empty array');
      return [];
    }
  },

  /**
   * Get all package types for the authenticated user
   */
  async getAllPackages(): Promise<AllPackagesResponse> {
    try {
      const [dsResponse, sbResponse, ibResponse] = await Promise.allSettled([
        packagesApi.getDailySavings(),
        packagesApi.getSBPackages(),
        packagesApi.getIBPackages(),
      ]);

      return {
        dailySavings: dsResponse.status === 'fulfilled' ? dsResponse.value : [],
        sbPackages: sbResponse.status === 'fulfilled' ? sbResponse.value : [],
        ibPackages: ibResponse.status === 'fulfilled' ? ibResponse.value : [],
      };
    } catch (error) {
      console.error('Error fetching packages:', error);
      return {
        dailySavings: [],
        sbPackages: [],
        ibPackages: [],
      };
    }
  },

  /**
   * Create a new daily savings package
   */
  async createDailySavingsPackage(
    data: CreateDailySavingsPackageParams
  ): Promise<DailySavingsPackage> {
    const response = await apiClient.post<DailySavingsPackage>(
      '/daily-savings/self-package',
      data
    );
    return response.data;
  },

  /**
   * Create a new Savings-Buying (SB) package
   */
  async createSBPackage(data: CreateSBPackageParams): Promise<SBPackage> {
    const response = await apiClient.post<SBPackage>('/daily-savings/sb/self-package', data);
    return response.data;
  },

  /**
   * Get SB package by ID
   */
  async getSBPackageById(packageId: string): Promise<SBPackage> {
    const response = await apiClient.get<SBPackage>(`/daily-savings/sb/package/${packageId}`);
    return response.data;
  },

  /**
   * Edit daily savings package
   */
  async editDailySavingsPackage(
    packageId: string,
    data: { target: string; amountPerDay: number }
  ): Promise<DailySavingsPackage> {
    const response = await apiClient.patch<DailySavingsPackage>(
      `/daily-savings/package/${packageId}`,
      data
    );
    return response.data;
  },

  /**
   * Get package statistics
   */
  async getPackageStats(): Promise<{
    totalPackages: number;
    activePackages: number;
    totalContributions: number;
    totalTarget: number;
  }> {
    const packages = await packagesApi.getAllPackages();

    const allPackages = [
      ...packages.dailySavings,
      ...packages.sbPackages,
      ...packages.ibPackages,
    ];

    const activePackages = allPackages.filter(
      (pkg) => pkg.status === 'active' || pkg.status === 'Active'
    );

    const totalContributions = packages.dailySavings.reduce(
      (sum, pkg) => sum + (pkg.totalContribution || 0),
      0
    ) + packages.sbPackages.reduce(
      (sum, pkg) => sum + (pkg.totalContribution || 0),
      0
    ) + packages.ibPackages.reduce(
      (sum, pkg) => sum + (pkg.principalAmount || 0),
      0
    );

    const totalTarget = packages.dailySavings.reduce(
      (sum, pkg) => sum + (pkg.targetAmount || 0),
      0
    ) + packages.sbPackages.reduce(
      (sum, pkg) => sum + (pkg.targetAmount || 0),
      0
    );

    return {
      totalPackages: allPackages.length,
      activePackages: activePackages.length,
      totalContributions,
      totalTarget,
    };
  },
};

export default packagesApi;