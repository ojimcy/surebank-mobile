/**
 * useTransactionsQuery Hook
 *
 * React Query hook for managing transaction data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import transactionsApi, {
  Transaction,
  TransactionFilters,
  FormattedTransaction,
} from '@/services/api/transactions';

interface UseTransactionsQueryOptions extends TransactionFilters {
  enabled?: boolean;
}

export function useTransactionsQuery(options: UseTransactionsQueryOptions = {}) {
  const { enabled = true, ...filters } = options;

  // Fetch transactions
  const {
    data: transactionData,
    isLoading,
    isError,
    error,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getUserTransactions(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Format transactions for UI display
  const formattedTransactions = useMemo(() => {
    if (!transactionData?.transactions) return [];
    return transactionsApi.formatTransactions(transactionData.transactions);
  }, [transactionData]);

  return {
    // Data
    transactions: transactionData?.transactions || [],
    formattedTransactions,
    pagination: transactionData
      ? {
          page: transactionData.page,
          limit: transactionData.limit,
          totalPages: transactionData.totalPages,
          totalResults: transactionData.totalResults,
        }
      : null,

    // Status
    isLoading,
    isError,
    error,
    hasTransactions: (transactionData?.transactions?.length || 0) > 0,

    // Actions
    refetchTransactions,
  };
}

/**
 * Hook specifically for recent transactions (used in dashboard)
 */
export function useRecentTransactions() {
  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: transactionsApi.getRecentTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Format transactions for UI display
  const formattedTransactions = useMemo(() => {
    return transactionsApi.formatTransactions(transactions);
  }, [transactions]);

  return {
    transactions: formattedTransactions,
    isLoading,
    isError,
    error,
    refetch,
  };
}