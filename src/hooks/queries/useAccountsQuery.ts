/**
 * useAccountsQuery Hook
 *
 * React Query hook for managing account data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import accountsApi, { Account, AccountType } from '@/services/api/accounts';

export function useAccountsQuery() {
  const queryClient = useQueryClient();

  // Fetch all user accounts
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getUserAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: (accountType: AccountType) => accountsApi.createAccount(accountType),
    onSuccess: (newAccount) => {
      // Update the accounts cache
      queryClient.setQueryData(['accounts'], (old: Account[] = []) => [...old, newAccount]);

      // Show success message
      Alert.alert('Success', 'Account created successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to create account. Please try again.'
      );
    },
  });

  // Get account by type
  const getAccountByType = (type: AccountType): Account | undefined => {
    return accounts.find(account => account.accountType === type);
  };

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, account) => sum + (account.availableBalance || 0),
    0
  );

  const hasAccounts = accounts.length > 0;

  // Check if user has specific account type
  const hasAccountType = (type: AccountType): boolean => {
    return accounts.some(account => account.accountType === type);
  };

  return {
    // Data
    accounts,
    totalBalance,
    hasAccounts,

    // Status
    isLoading,
    isError,
    error,

    // Actions
    refetchAccounts,
    createAccount: createAccountMutation.mutate,
    isCreatingAccount: createAccountMutation.isPending,

    // Helpers
    getAccountByType,
    hasAccountType,
  };
}