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
  status: 'active' | 'closed' | 'pending' | 'open';
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
  status: 'active' | 'closed' | 'pending' | 'open';
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
  authorizationUrl?: string; // Alternative naming
  access_code: string;
  accessCode?: string; // Alternative naming
}

export interface GetAllPackagesResponse {
  dailySavings: DailySavingsPackage[];
  sbPackages: SBPackage[];
  ibPackages: IBPackage[];
}

export interface MergeSavingsPackagesParams {
  targetPackageId: string;
  sourcePackageIds: string[];
}

export interface UpdatePackageProductParams {
  packageId: string;
  newProductId: string;
}

// Package API Service
export class PackagesService {
  /**
   * Get all packages for authenticated user
   */
  async getAllPackages(): Promise<GetAllPackagesResponse> {
    try {
      // Fetch all package types in parallel
      const [dailySavingsResponse, sbResponse, ibResponse] = await Promise.all([
        apiUtils.requestWithRetry(
          () => apiClient.get<DailySavingsPackage[]>('/daily-savings/package'),
          2,
          1000
        ).catch(() => ({ data: [] })), // Return empty array on error
        apiUtils.requestWithRetry(
          () => apiClient.get<SBPackage[]>('/daily-savings/sb/package'),
          2,
          1000
        ).catch(() => ({ data: [] })),
        apiUtils.requestWithRetry(
          () => apiClient.get<IBPackage[]>('/interest-savings/package'),
          2,
          1000
        ).catch(() => ({ data: [] }))
      ]);

      return {
        dailySavings: dailySavingsResponse.data,
        sbPackages: sbResponse.data,
        ibPackages: ibResponse.data
      };
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
        () => apiClient.get(`/self-accounts?accountType=${accountType}`),
        2,
        1000
      );
      return response.status === 200;
    } catch (error: any) {
      // Return false if 404 (user has no account of this type)
      if (error?.response?.status === 404) {
        return false;
      }
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
        () => apiClient.post<DailySavingsPackage>('/daily-savings/self-package', params),
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
        () => apiClient.post<SBPackage>('/daily-savings/sb/self-package', params),
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
   * Initiate IB Package Payment (returns payment details)
   * Uses the generic contribution endpoint with interest_package type
   */
  async initiateIBPackagePayment(params: InitiateIBPackageParams): Promise<InitiateIBPackageResponse> {
    try {
      // Convert to contribution format used by the API
      // Note: compoundingFrequency is not sent during payment initiation
      const contributionParams = {
        contributionType: 'interest_package' as const,
        amount: params.principalAmount,
        name: params.name,
        principalAmount: params.principalAmount,
        interestRate: params.interestRate,
        lockPeriod: params.lockPeriod,
      };

      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<any>('/payments/init-contribution', contributionParams),
        2,
        1000
      );

      // Map response to expected format
      const data = response.data?.data || response.data;
      return {
        reference: data.reference,
        authorization_url: data.authorization_url || data.authorizationUrl,
        access_code: data.access_code || data.accessCode,
        principalAmount: params.principalAmount,
        interestRate: params.interestRate,
        lockPeriod: params.lockPeriod,
      };
    } catch (error) {
      console.error('Failed to initiate IB package payment:', error);
      throw error;
    }
  }

  /**
   * Create IB Package (after successful payment)
   */
  async createIBPackage(params: CreateIBPackageParams): Promise<IBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<IBPackage>('/interest-package/package', params),
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
        () => apiClient.post<any>('/payments/init-contribution', params),
        2,
        1000
      );

      // Handle response format variations
      const data = response.data?.data || response.data;
      return {
        reference: data.reference,
        authorization_url: data.authorization_url || data.authorizationUrl,
        authorizationUrl: data.authorization_url || data.authorizationUrl,
        access_code: data.access_code || data.accessCode,
        accessCode: data.access_code || data.accessCode,
      };
    } catch (error) {
      console.error('Failed to initialize contribution:', error);
      throw error;
    }
  }

  /**
   * Get Daily Savings packages for a user
   */
  async getDailySavings(userId?: string): Promise<DailySavingsPackage[]> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get<DailySavingsPackage[]>('/daily-savings/package'),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch daily savings packages:', error);
      return [];
    }
  }

  /**
   * Get SB packages for a user
   */
  async getSBPackages(userId?: string): Promise<SBPackage[]> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get<SBPackage[]>('/daily-savings/sb/package'),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SB packages:', error);
      return [];
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
   * Merge multiple SB packages into one target package
   */
  async mergeSavingsPackages(targetPackageId: string, sourcePackageIds: string[]): Promise<SBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<SBPackage>(
          `/daily-savings/sb/package/merge/${targetPackageId}`,
          { sourcePackageIds }
        ),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to merge packages:', error);
      throw error;
    }
  }

  /**
   * Update/change the product of an SB package
   */
  async updatePackageProduct(packageId: string, newProductId: string): Promise<SBPackage> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.patch<SBPackage>(
          `/daily-savings/sb/package/${packageId}`,
          { newProductId }
        ),
        2,
        1000
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update package product:', error);
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
        progress: Math.min(Math.floor((pkg.totalCount / 30) * 100), 100), // Based on 30 days of saving
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
      // Calculate progress based on time elapsed towards maturity
      const today = new Date();
      const startDate = new Date(Number(pkg.startDate || pkg.createdAt));
      const maturityDate = new Date(Number(pkg.maturityDate));

      const totalDuration = maturityDate.getTime() - startDate.getTime();
      const elapsedTime = today.getTime() - startDate.getTime();

      let progress = 0;
      if (totalDuration > 0) {
        progress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 100);
      }

      packages.push({
        id: pkg._id || pkg.id!,
        title: pkg.name,
        type: 'IBS',
        typeLabel: 'Interest-Based',
        icon: 'trending-up-outline',
        progress: progress, // Based on time elapsed towards maturity
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