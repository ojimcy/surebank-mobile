/**
 * Cards API Service
 *
 * Handles all card-related API operations including storing,
 * fetching, updating, and deleting payment cards.
 */

import apiClient from './client';

// Raw API response interface
interface StoredCardApiResponse {
  id: string;
  userId: string;
  cardType: string;
  bank: string;
  isDefault: boolean;
  isActive: boolean;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  authorizationCode: string;
  signature: string;
  lastValidated: string;
  failedAttempts: number;
  metadata: {
    bin: string;
    channel: string;
    countryCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Frontend interface
export interface StoredCard {
  _id: string;
  userId: string;
  cardNumber: string;
  cardType: string;
  bank: string;
  isDefault: boolean;
  isActive: boolean;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  authorizationCode: string;
  createdAt: string;
  updatedAt: string;
}

// Transform API response to frontend interface
const transformStoredCard = (apiCard: StoredCardApiResponse): StoredCard => ({
  _id: apiCard.id,
  userId: apiCard.userId,
  cardNumber: `•••• •••• •••• ${apiCard.last4}`,
  cardType: apiCard.cardType,
  bank: apiCard.bank,
  isDefault: apiCard.isDefault,
  isActive: apiCard.isActive,
  lastFourDigits: apiCard.last4,
  expiryMonth: apiCard.expiryMonth,
  expiryYear: apiCard.expiryYear,
  authorizationCode: apiCard.authorizationCode,
  createdAt: apiCard.createdAt,
  updatedAt: apiCard.updatedAt,
});

export interface StoreCardPayload {
  paystackReference: string;
  setAsDefault?: boolean;
}

export interface CardVerificationPayload {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
  amount: number;
}

export interface ValidateCardPayload {
  pin: string;
  otp?: string;
}

export interface ValidateCardResponse {
  success: boolean;
  message?: string;
  requiresOTP?: boolean;
}

const cardsApi = {
  /**
   * Store a new card using Paystack transaction reference
   */
  async storeCard(payload: StoreCardPayload): Promise<StoredCard> {
    const response = await apiClient.post<{ data: StoredCardApiResponse }>(
      '/stored-cards',
      payload
    );
    return transformStoredCard(response.data.data);
  },

  /**
   * Initialize card verification payment with Paystack
   */
  async initializeCardVerification() {
    const response = await apiClient.post('/stored-cards/initialize-verification');
    return response.data;
  },

  /**
   * Get all user cards
   */
  async getUserCards(): Promise<StoredCard[]> {
    const response = await apiClient.get<{ data: StoredCardApiResponse[] }>('/stored-cards');
    return response.data.data.map(transformStoredCard);
  },

  /**
   * Get default card
   */
  async getDefaultCard(): Promise<StoredCard | null> {
    const response = await apiClient.get<{ data: StoredCardApiResponse | null }>(
      '/stored-cards/default'
    );
    return response.data.data ? transformStoredCard(response.data.data) : null;
  },

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<StoredCard> {
    const response = await apiClient.get<{ data: StoredCardApiResponse }>(
      `/stored-cards/${cardId}`
    );
    return transformStoredCard(response.data.data);
  },

  /**
   * Set a card as default
   */
  async setDefaultCard(cardId: string): Promise<StoredCard> {
    const response = await apiClient.patch<{ data: StoredCardApiResponse }>(
      `/stored-cards/${cardId}`,
      { isDefault: true }
    );
    return transformStoredCard(response.data.data);
  },

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete(`/stored-cards/${cardId}`);
  },

  /**
   * Deactivate a card
   */
  async deactivateCard(cardId: string): Promise<StoredCard> {
    const response = await apiClient.patch<{ data: StoredCardApiResponse }>(
      `/stored-cards/${cardId}/deactivate`
    );
    return transformStoredCard(response.data.data);
  },

  /**
   * Activate a card
   */
  async activateCard(cardId: string): Promise<StoredCard> {
    const response = await apiClient.patch<{ data: StoredCardApiResponse }>(
      `/stored-cards/${cardId}/activate`
    );
    return transformStoredCard(response.data.data);
  },

  /**
   * Validate a card (for PIN/OTP verification)
   */
  async validateCard(cardId: string, payload: ValidateCardPayload): Promise<ValidateCardResponse> {
    const response = await apiClient.post<ValidateCardResponse>(
      `/stored-cards/${cardId}/validate`,
      payload
    );
    return response.data;
  },
};

export default cardsApi;