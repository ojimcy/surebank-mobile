/**
 * Card Queries Hook
 *
 * Manages payment card operations using TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import cardsApi from '@/services/api/cards';

export interface Card {
  _id: string;
  userId: string;
  lastFourDigits: string;
  bank: string;
  cardType: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCardQueries() {
  const {
    data: cards,
    isLoading: isCardsLoading,
    isError: isCardsError,
    error: cardsError,
    refetch: refetchCards,
  } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const response = await cardsApi.getUserCards();
      return response.cards || [];
    },
  });

  return {
    cards: cards || [],
    hasCards: (cards || []).length > 0,
    isCardsLoading,
    isCardsError,
    cardsError,
    refetchCards,
  };
}