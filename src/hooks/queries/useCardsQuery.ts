/**
 * useCardsQuery Hook
 *
 * React Query hook for managing card data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import cardsApi, {
  StoredCard,
  StoreCardPayload,
  ValidateCardPayload,
  ValidateCardResponse,
} from '@/services/api/cards';

export function useCardsQuery() {
  const queryClient = useQueryClient();

  // Get user cards query
  const {
    data: cardsData,
    isLoading: isCardsLoading,
    isError: isCardsError,
    error: cardsError,
    refetch: refetchCards,
  } = useQuery({
    queryKey: ['cards'],
    queryFn: cardsApi.getUserCards,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract cards array from response
  const cards = cardsData?.cards || [];

  // Get default card query
  const {
    data: defaultCard,
    isLoading: isDefaultCardLoading,
    isError: isDefaultCardError,
    refetch: refetchDefaultCard,
  } = useQuery({
    queryKey: ['defaultCard'],
    queryFn: cardsApi.getDefaultCard,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Store card mutation
  const {
    mutate: storeCard,
    mutateAsync: storeCardAsync,
    isPending: isStoreCardLoading,
    isError: isStoreCardError,
  } = useMutation({
    mutationFn: cardsApi.storeCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
      Alert.alert('Success', 'Your card has been added successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not add card. Please try again.'
      );
    },
  });

  // Set default card mutation
  const {
    mutate: setDefaultCard,
    mutateAsync: setDefaultCardAsync,
    isPending: isSetDefaultCardLoading,
  } = useMutation({
    mutationFn: cardsApi.setDefaultCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
      Alert.alert('Success', 'Default card updated successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not update default card. Please try again.'
      );
    },
  });

  // Delete card mutation
  const {
    mutate: deleteCard,
    mutateAsync: deleteCardAsync,
    isPending: isDeleteCardLoading,
  } = useMutation({
    mutationFn: cardsApi.deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
      Alert.alert('Success', 'Card deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not delete card. Please try again.'
      );
    },
  });

  // Deactivate card mutation
  const {
    mutate: deactivateCard,
    mutateAsync: deactivateCardAsync,
    isPending: isDeactivateCardLoading,
  } = useMutation({
    mutationFn: cardsApi.deactivateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
      Alert.alert('Success', 'Card deactivated successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not deactivate card. Please try again.'
      );
    },
  });

  // Activate card mutation
  const {
    mutate: activateCard,
    mutateAsync: activateCardAsync,
    isPending: isActivateCardLoading,
  } = useMutation({
    mutationFn: cardsApi.activateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
      Alert.alert('Success', 'Card activated successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not activate card. Please try again.'
      );
    },
  });

  // Validate card mutation
  const {
    mutate: validateCard,
    mutateAsync: validateCardAsync,
    isPending: isValidateCardLoading,
  } = useMutation<
    ValidateCardResponse,
    Error,
    { cardId: string; payload: ValidateCardPayload }
  >({
    mutationFn: ({ cardId, payload }) => cardsApi.validateCard(cardId, payload),
    onSuccess: (data) => {
      if (data.requiresOTP) {
        Alert.alert('OTP Required', 'Please enter the OTP sent to your phone');
      } else {
        Alert.alert('Success', 'Card validated successfully');
      }
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not validate card. Please try again.'
      );
    },
  });

  // Get specific card
  const getCard = async (cardId: string) => {
    try {
      return await cardsApi.getCard(cardId);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not fetch card details'
      );
      throw error;
    }
  };

  return {
    // Cards data
    cards,
    defaultCard,
    hasCards: cards.length > 0,
    activeCards: cards.filter((card) => card.isActive),

    // Action methods
    storeCard,
    storeCardAsync,
    setDefaultCard,
    setDefaultCardAsync,
    deleteCard,
    deleteCardAsync,
    deactivateCard,
    deactivateCardAsync,
    activateCard,
    activateCardAsync,
    validateCard,
    validateCardAsync,
    getCard,
    refetchCards,
    refetchDefaultCard,

    // Loading states
    isCardsLoading,
    isDefaultCardLoading,
    isStoreCardLoading,
    isSetDefaultCardLoading,
    isDeleteCardLoading,
    isDeactivateCardLoading,
    isActivateCardLoading,
    isValidateCardLoading,

    // Error states
    isCardsError,
    isDefaultCardError,
    isStoreCardError,
  };
}

/**
 * Hook for a single card
 */
export function useSingleCardQuery(cardId: string) {
  const {
    data: card,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.getCard(cardId),
    enabled: !!cardId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    card,
    isLoading,
    isError,
    error,
    refetch,
  };
}