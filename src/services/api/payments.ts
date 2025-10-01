/**
 * Payments API Service
 *
 * Handles payment-related operations including withdrawals,
 * bank account verification, and multi-account transactions.
 */

import apiClient from './client';

// Types
export interface WithdrawalRequestParams {
  amount: number;
  bankName: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface MultiAccountWithdrawalParams {
  withdrawalAccounts: Array<{
    accountNumber: string;
    amount: number;
  }>;
  bankName: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  reason?: string;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankId?: number;
  bankCode?: string;
}

export interface Bank {
  name: string;
  code: string;
  active?: boolean;
  country?: string;
  currency?: string;
  type?: string;
  id?: number;
  slug?: string;
  longcode?: string;
}

export interface AccountWithBalance {
  _id: string;
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  ledgerBalance: number;
  heldAmount: number;
  accountManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  branch?: {
    _id: string;
    name: string;
  };
  status: string;
}

export interface MultiWithdrawalResponse {
  withdrawalRequests: Array<{
    _id: string;
    userId: string;
    accountNumber: string;
    amount: number;
    status: string;
    narration: string;
    relatedWithdrawalGroup: string;
    date: number;
    createdAt: string;
  }>;
  totalAmount: number;
  groupId: string;
  summary: {
    accountsCount: number;
    totalAmount: number;
    bankDetails: {
      bankName: string;
      bankAccountNumber: string;
      bankAccountName: string;
    };
  };
}

export interface SavedBankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  lastUsed: string;
}

// API Functions
const paymentsApi = {
  /**
   * Create a withdrawal request
   */
  async createWithdrawalRequest(params: WithdrawalRequestParams) {
    const response = await apiClient.post('/payments/withdrawal/request', params);
    return response.data;
  },

  /**
   * Get user accounts with balances for withdrawal selection
   */
  async getUserAccountsWithBalances(): Promise<AccountWithBalance[]> {
    const response = await apiClient.get<AccountWithBalance[]>('/accounts/self/balances');
    return response.data;
  },

  /**
   * Create multi-account withdrawal request
   */
  async createMultiAccountWithdrawalRequest(
    params: MultiAccountWithdrawalParams
  ): Promise<MultiWithdrawalResponse> {
    const response = await apiClient.post<MultiWithdrawalResponse>(
      '/payments/withdrawal/multi-request',
      params
    );
    return response.data;
  },

  /**
   * Get list of banks from backend
   *
   * Backend endpoint required: GET /payments/banks
   * The backend should fetch banks from Paystack API using:
   * - Endpoint: https://api.paystack.co/bank?currency=NGN
   * - Headers: Authorization: Bearer YOUR_PAYSTACK_SECRET_KEY
   *
   * @returns List of banks
   */
  async getBanks(): Promise<Bank[]> {
    try {
      console.log('[getBanks] Calling API endpoint: /payments/banks');
      const response = await apiClient.get<Bank[]>('/payments/banks');
      console.log('[getBanks] Success! Banks count:', response.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('[getBanks] Error details:', {
        message: error.message,
        status: error.status || error.response?.status,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  },

  /**
   * Verify bank account through backend
   *
   * Backend endpoint required: POST /payments/verify-bank-account
   * The backend should verify account using Paystack API:
   * - Endpoint: https://api.paystack.co/bank/resolve
   * - Query params: account_number={accountNumber}&bank_code={bankCode}
   * - Headers: Authorization: Bearer YOUR_PAYSTACK_SECRET_KEY
   *
   * Expected response format:
   * {
   *   accountName: string,
   *   accountNumber: string,
   *   bankId?: number,
   *   bankCode?: string
   * }
   *
   * @param bankCode Bank code
   * @param accountNumber Account number
   * @returns Bank account details
   */
  async verifyBankAccount(bankCode: string, accountNumber: string): Promise<BankAccount> {
    try {
      const response = await apiClient.post<BankAccount>('/payments/verify-bank-account', {
        bankCode,
        accountNumber,
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying bank account:', error);
      throw error;
    }
  },
};

export default paymentsApi;