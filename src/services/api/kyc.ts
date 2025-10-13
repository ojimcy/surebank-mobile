/**
 * KYC API Service
 *
 * Handles all KYC (Know Your Customer) verification related API operations
 * including ID verification, BVN verification, and status checks.
 */

import apiClient from './client';

// Types
export interface KycIdVerificationPayload {
  name: string;
  kycType: 'id' | 'bvn';
  idType?: string;
  idNumber?: string;
  idImage?: string;
  expiryDate?: string;
  address?: string;
  dateOfBirth: string;
  phoneNumber: string;
  bvn?: string;
}

export interface KycResponse {
  success: boolean;
  message?: string;
  id?: string;
  status?: string;
}

export interface KycStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  message?: string;
  updatedAt?: string;
  kycType?: string;
  rejectionReason?: string;
}

export interface BvnVerificationPayload {
  bvn: string;
  dateOfBirth: string;
  phoneNumber: string;
}

// API Functions
const kycApi = {
  /**
   * Submit ID verification request
   */
  async submitIdVerification(data: KycIdVerificationPayload): Promise<KycResponse> {
    try {
      const response = await apiClient.post<{ _id?: string; id?: string; status?: string }>(
        '/kyc',
        data
      );

      // Backend returns the created KYC document
      const kyc = response.data;
      return {
        success: true,
        id: kyc.id || kyc._id,
        status: kyc.status,
      };
    } catch (error: any) {
      console.error('KYC submission error:', error);
      throw error;
    }
  },

  /**
   * Submit BVN verification request
   */
  async submitBvnVerification(data: BvnVerificationPayload): Promise<KycResponse> {
    try {
      const payload: KycIdVerificationPayload = {
        ...data,
        name: '', // Will be filled from BVN data
        kycType: 'bvn',
      };

      const response = await apiClient.post<{ _id?: string; id?: string; status?: string }>(
        '/kyc',
        payload
      );

      const kyc = response.data;
      return {
        success: true,
        id: kyc.id || kyc._id,
        status: kyc.status,
      };
    } catch (error: any) {
      console.error('BVN verification error:', error);
      throw error;
    }
  },

  /**
   * Get KYC verification status
   */
  async getVerificationStatus(): Promise<KycStatus> {
    try {
      const response = await apiClient.get<KycStatus>('/kyc/status');
      return response.data;
    } catch (error: any) {
      console.error('Get KYC status error:', error);

      // If 404, user hasn't submitted KYC yet
      if (error.response?.status === 404) {
        return {
          status: 'not_submitted',
          message: 'KYC not submitted',
        };
      }

      throw error;
    }
  },

  /**
   * Check if user's KYC is verified
   */
  async isKycVerified(): Promise<boolean> {
    try {
      const status = await this.getVerificationStatus();
      return status.status === 'approved';
    } catch (error) {
      console.error('KYC verification check error:', error);
      return false;
    }
  },

  /**
   * Get KYC document by ID
   */
  async getKycDocument(kycId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/kyc/${kycId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get KYC document error:', error);
      throw error;
    }
  },
};

export default kycApi;