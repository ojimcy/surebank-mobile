/**
 * SureBank API Types
 * 
 * TypeScript interfaces for all API requests and responses
 * used throughout the authentication and application flows.
 */

// User and authentication related types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  isActive: boolean;
  kycStatus?: 'verified' | 'approved' | 'pending' | 'rejected' | 'failed' | 'unverified';
  kycType?: 'id' | 'bvn';
  bvnVerified?: boolean;
  isEmailVerified: boolean;
  isVerified?: boolean;
  isTwoFactorAuthEnabled: boolean;
  passwordAttempts: number;
  lastPasswordChange: string;
  loginAttempts?: number;
  passwordHistory?: Array<any>;
  paystackCustomerId?: string;
  virtualAccounts?: Array<any>;
  walletBalance?: number;
  createdAt: string;
  updatedAt: string;
  packages?: Array<any>;
}

export interface TokenResponse {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// Authentication request payloads
export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
}

export interface VerifyPayload {
  code: string;
  email?: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface VerifyResetCodePayload {
  code: string;
  email: string;
}

export interface NewPasswordPayload {
  password: string;
  code: string;
  email: string;
}

// Authentication response types
export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

export interface RegisterResponse {
  success: boolean;
  identifier: string;
  message?: string;
}

export interface VerifyResponse {
  user: User;
  tokens?: TokenResponse;
  message?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

// API Error response structure
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

export interface ApiErrorResponse {
  error: ApiError;
  status: number;
  timestamp: string;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
}

// Network and request types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
}

// Utility types for API operations
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  method: ApiMethod;
  url: string;
  requiresAuth?: boolean;
  timeout?: number;
}

// Authentication state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: TokenResponse | null;
  lastLogin: string | null;
  rememberMe: boolean;
}

// PIN and biometric types
export interface BiometricConfig {
  isAvailable: boolean;
  isEnabled: boolean;
  supportedTypes: Array<'fingerprint' | 'faceId' | 'iris'>;
}

export interface PinConfig {
  isSet: boolean;
  length: 4 | 6;
  maxAttempts: 3;
  currentAttempts: number;
  isLocked: boolean;
  lockoutUntil?: string;
  inactivityTimeout: number;
}

// Session management types
export interface SessionInfo {
  startTime: string;
  lastActivity: string;
  isActive: boolean;
  deviceInfo?: {
    platform: string;
    version: string;
    model: string;
  };
}

// Input validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

export interface InputValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

// Form state types for authentication screens
export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  address?: string;
  agreeToTerms: boolean;
}

export interface VerificationFormData {
  code: string;
  resendAvailable: boolean;
  timeUntilResend: number;
}

export interface PasswordResetFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
  code: string;
}

export interface PinFormData {
  pin: string;
  confirmPin?: string;
  enableBiometric?: boolean;
}

// Error handling types
export interface NetworkError extends Error {
  code: string;
  status?: number;
  response?: any;
  isRetriable: boolean;
}

export interface AuthError extends Error {
  type: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'TOKEN_EXPIRED' | 'NETWORK_ERROR' | 'UNKNOWN';
  code: string;
  retryAfter?: number;
  details?: any;
}

// Utility type helpers
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type NonEmptyArray<T> = [T, ...T[]];

// API status types
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Export default collection for easy importing
export default {
  // Types are exported individually above
};