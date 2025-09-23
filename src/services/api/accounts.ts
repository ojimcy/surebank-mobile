/**
 * Accounts API Service
 *
 * Handles all account-related API operations including
 * fetching user accounts, creating new accounts, and account management.
 */

import apiClient from './client';
import { AxiosError } from 'axios';

// Types
export interface Account {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountNumber: string;
  availableBalance: number;
  ledgerBalance: number;
  accountType: 'ds' | 'sb' | 'ibs';
  branchId: {
    _id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  paystackCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'ds' | 'sb' | 'ibs';

export const ACCOUNT_TYPE_DISPLAY: Record<AccountType, string> = {
  ds: 'Daily Savings',
  sb: 'SureBank',
  ibs: 'Interest-Based Savings',
};

export const ACCOUNT_TYPE_SHORT: Record<AccountType, string> = {
  ds: 'DS',
  sb: 'SB',
  ibs: 'IBS',
};

// API Functions
const accountsApi = {
  /**
   * Get all accounts for the authenticated user
   */
  async getUserAccounts(): Promise<Account[]> {
    try {
      const response = await apiClient.get<Account[] | Account>('/self-accounts/all');
      // If response is a single account, wrap it in an array
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      // Return empty array if 404 (user has no accounts)
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Get a specific account by type for the authenticated user
   */
  async getUserAccountByType(
    accountType: AccountType,
    abortSignal?: AbortSignal
  ): Promise<Account | null> {
    try {
      const response = await apiClient.get<Account>(
        `/self-accounts?accountType=${accountType}`,
        {
          signal: abortSignal,
        }
      );
      return response.data;
    } catch (error) {
      // If the request was aborted, handle it quietly
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }

      // Return null if 404 (user has no account of this type)
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new account for the authenticated user
   */
  async createAccount(accountType: AccountType): Promise<Account> {
    try {
      console.log('Creating account with type:', accountType);
      const response = await apiClient.post<Account>('/self-accounts', { accountType });
      console.log('Account creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Account creation failed:', {
        accountType,
        error: error.message,
        response: error.response,
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  },

  /**
   * Get total balance across all accounts
   */
  async getTotalBalance(): Promise<{
    availableBalance: number;
    ledgerBalance: number;
  }> {
    const accounts = await accountsApi.getUserAccounts();

    return accounts.reduce(
      (totals, account) => ({
        availableBalance: totals.availableBalance + (account.availableBalance || 0),
        ledgerBalance: totals.ledgerBalance + (account.ledgerBalance || 0),
      }),
      { availableBalance: 0, ledgerBalance: 0 }
    );
  },

  /**
   * Check if user has a specific account type
   */
  async hasAccountType(accountType: AccountType): Promise<boolean> {
    try {
      const response = await apiClient.get(`/self-accounts?accountType=${accountType}`);
      return response.status === 200;
    } catch (error) {
      const axiosError = error as AxiosError;
      return axiosError.response?.status !== 404;
    }
  },
};

export default accountsApi;