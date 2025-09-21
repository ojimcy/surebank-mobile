/**
 * Formatting utilities for the SureBank application
 */

/**
 * Format a number as Nigerian Naira currency
 * @param amount The numeric amount to format
 * @returns Formatted currency string with ₦ symbol
 */
export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return '₦0.00';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format a date string to a readable format
 * @param date Date string or Date object
 * @param format Format type: 'short' | 'long' | 'time'
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : format === 'time'
      ? { hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return dateObj.toLocaleDateString('en-NG', options);
};

/**
 * Format a phone number for display
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Format a number with thousand separators
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string): string => {
  const numericValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numericValue)) {
    return '0';
  }

  return numericValue.toLocaleString('en-NG');
};

/**
 * Format percentage value
 * @param value Percentage value
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};