/**
 * Transactions API Service
 *
 * Handles all transaction-related API operations including
 * fetching transaction history, filtering, and transaction details.
 */

import apiClient from './client';

// Types
export interface Transaction {
  id?: string;
  _id?: string;  // MongoDB ID field
  userId: string;
  accountNumber: string;
  amount: number;
  bankAccountNumber?: number;
  bankAccountName?: string;
  bankName?: string;
  bankCode?: string;
  status?: string;
  isEarlyWithdrawal?: boolean;
  narration: string;
  branchId: string;
  direction: 'inflow' | 'outflow';
  date: number;
  penaltyAmount: number;
  packageId?: string;
  reference?: string;
  transactionType?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface TransactionFilters {
  startDate?: number;
  endDate?: number;
  direction?: 'inflow' | 'outflow';
  page?: number;
  limit?: number;
}

// Helper Types for UI display
export interface FormattedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'other';
  category: string;
  amount: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  rawTransaction?: Transaction;
}

// API Functions
const transactionsApi = {
  /**
   * Get user transactions with optional filters
   */
  async getUserTransactions(filters: TransactionFilters = {}): Promise<TransactionResponse> {
    const { page = 1, limit = 20, startDate, endDate, direction } = filters;

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());
    if (direction) params.append('direction', direction);

    const response = await apiClient.get<TransactionResponse>(`/transactions/self?${params.toString()}`);
    return response.data;
  },

  /**
   * Get recent transactions (limited to 10 for dashboard)
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    const response = await transactionsApi.getUserTransactions({ limit: 10 });
    return response.transactions;
  },

  /**
   * Get package transactions
   * Fetches all transactions and filters those related to a specific package
   * Note: Since the API doesn't support packageId filtering, we fetch all and filter client-side
   */
  async getPackageTransactions(packageId: string, page = 1, limit = 100): Promise<TransactionResponse> {
    // Fetch more transactions to ensure we get package-specific ones
    const response = await transactionsApi.getUserTransactions({ page, limit });

    // Filter transactions that belong to this package
    // Check both packageId field and narration for package references
    const packageTransactions = response.transactions.filter(transaction => {
      // First check if packageId matches
      if (transaction.packageId === packageId) {
        return true;
      }

      // Also check narration for package reference (fallback)
      const narration = transaction.narration.toLowerCase();

      // Check for account number in narration (packages often have account numbers)
      if (transaction.accountNumber) {
        return narration.includes(transaction.accountNumber.toLowerCase());
      }

      return false;
    });

    return {
      ...response,
      transactions: packageTransactions,
      totalResults: packageTransactions.length
    };
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${transactionId}`);
    return response.data;
  },

  /**
   * Format transaction for UI display
   */
  formatTransaction(transaction: Transaction): FormattedTransaction {
    // Handle date properly - it's a number (Unix timestamp in milliseconds)
    const transactionDate = new Date(transaction.date || transaction.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Determine date string
    let dateString: string;
    if (transactionDate.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      dateString = 'Yesterday';
    } else {
      dateString = transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    // Format time
    const timeString = transactionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Determine category from narration
    const category = transactionsApi.getCategoryFromNarration(transaction);

    // Determine transaction type
    const type = transactionsApi.getTransactionType(transaction);

    return {
      id: transaction.id || transaction._id || '',
      type,
      category,
      amount: transaction.amount,
      date: dateString,
      time: timeString,
      status: transaction.status === 'completed' ? 'completed' :
              transaction.status === 'failed' ? 'failed' : 'pending',
      description: transaction.narration,
      rawTransaction: transaction,
    };
  },

  /**
   * Format multiple transactions
   */
  formatTransactions(transactions: Transaction[]): FormattedTransaction[] {
    return transactions.map((transaction) => transactionsApi.formatTransaction(transaction));
  },

  /**
   * Get category from transaction narration
   */
  getCategoryFromNarration(transaction: Transaction): string {
    const narration = transaction.narration.toLowerCase();

    if (narration.includes('daily contribution')) {
      return 'Daily Savings';
    } else if (narration.includes('sb contribution')) {
      return 'SB Package';
    } else if (
      narration.includes('interest package withdrawal') ||
      narration.includes('sb transfer')
    ) {
      return 'Package Withdrawal';
    } else if (
      narration.includes('withdrawal request') ||
      narration.includes('request cash')
    ) {
      return 'Cash Withdrawal';
    } else if (
      narration.includes('ibs payment') ||
      narration.includes('ibs contribution')
    ) {
      return 'Interest Savings';
    } else if (narration.includes('payment for order')) {
      return 'Order Payment';
    } else if (narration.includes('deposit')) {
      return 'Deposit';
    } else {
      return 'Transaction';
    }
  },

  /**
   * Determine transaction type
   */
  getTransactionType(transaction: Transaction): 'deposit' | 'withdrawal' | 'other' {
    if (transaction.narration.toLowerCase().includes('payment for order')) {
      return 'other';
    }
    return transaction.direction === 'inflow' ? 'deposit' : 'withdrawal';
  },

  /**
   * Get transaction statistics
   */
  async getTransactionStats(filters: TransactionFilters = {}): Promise<{
    totalInflow: number;
    totalOutflow: number;
    transactionCount: number;
    balance: number;
  }> {
    const response = await transactionsApi.getUserTransactions({ ...filters, limit: 1000 });

    const totalInflow = response.transactions
      .filter((t) => t.direction === 'inflow')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = response.transactions
      .filter((t) => t.direction === 'outflow')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalInflow,
      totalOutflow,
      transactionCount: response.totalResults,
      balance: totalInflow - totalOutflow,
    };
  },
};

export default transactionsApi;