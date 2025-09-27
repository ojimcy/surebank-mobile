/**
 * Formatting utilities
 *
 * Common formatters for currency, dates, and other data types.
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency amount in Nigerian Naira
 */
export const formatCurrency = (amount: number | string, showSymbol = true): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return showSymbol ? '₦0' : '0';
  }

  const formatted = numAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `₦${formatted}` : formatted;
};

/**
 * Format date string to readable format
 */
export const formatDate = (
  date: string | Date | number,
  dateFormat: string = 'MMM dd, yyyy'
): string => {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return format(dateObj, dateFormat);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (
  date: string | Date | number,
  dateFormat: string = 'MMM dd, yyyy HH:mm'
): string => {
  return formatDate(date, dateFormat);
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: string | Date | number): string => {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    const absSeconds = Math.abs(diffInSeconds);

    if (absSeconds < 60) {
      return diffInSeconds > 0 ? 'just now' : 'in a moment';
    }

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(absSeconds / interval.seconds);
      if (count >= 1) {
        const plural = count !== 1 ? 's' : '';
        if (diffInSeconds > 0) {
          return `${count} ${interval.label}${plural} ago`;
        } else {
          return `in ${count} ${interval.label}${plural}`;
        }
      }
    }

    return 'just now';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
};

/**
 * Format phone number (Nigerian format)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a Nigerian number
  if (cleaned.startsWith('234')) {
    // Format as +234 XXX XXX XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Format as 0XXX XXX XXXX
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }

  return phone;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format account number (mask middle digits)
 */
export const formatAccountNumber = (accountNumber: string, visibleDigits: number = 4): string => {
  if (accountNumber.length <= visibleDigits * 2) return accountNumber;

  const start = accountNumber.substring(0, visibleDigits);
  const end = accountNumber.substring(accountNumber.length - visibleDigits);
  const masked = '*'.repeat(accountNumber.length - visibleDigits * 2);

  return `${start}${masked}${end}`;
};

/**
 * Format card number (show last 4 digits)
 */
export const formatCardNumber = (cardNumber: string): string => {
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

/**
 * Format duration in seconds to readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};