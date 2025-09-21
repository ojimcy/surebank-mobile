/**
 * Package Types and Constants
 * 
 * Defines the available package types and their configurations
 * for the SureBank mobile app.
 */

import type { PackageType } from '@/services/api/packages';

// Available Package Types
export const PACKAGE_TYPES: PackageType[] = [
    {
        id: 'ds',
        title: 'Daily Savings',
        description: 'Save regularly with flexible daily contributions towards your financial goals',
        icon: 'calendar-outline',
        color: '#0066A1',
        cta: 'Start Saving',
        features: [
            'Flexible deposit amounts',
            'Daily contributions',
            'Track progress towards goals',
            'No minimum balance',
        ],
    },
    {
        id: 'ibs',
        title: 'Interest-Based Savings',
        description: 'Earn competitive interest rates on your locked savings for fixed periods',
        icon: 'trending-up-outline',
        color: '#28A745',
        cta: 'Lock Funds',
        features: [
            'Competitive interest rates',
            'Fixed lock periods',
            'Guaranteed returns',
            'Secure investments',
        ],
    },
    {
        id: 'sb',
        title: 'SB Package',
        description: 'Save towards specific products with SureBank packages and flexible payment plans',
        icon: 'bag-outline',
        color: '#7952B3',
        cta: 'Choose Product',
        features: [
            'Save for specific products',
            'Flexible payment plans',
            'Product reservation',
            'Progress tracking',
            'Easy checkout',
        ],
    },
];

// Common Savings Targets for Daily Savings
export const COMMON_SAVINGS_TARGETS = [
    'School Fees',
    'House Rent',
    'Building Projects',
    'Shop Rent',
    'Vacation',
    'Wedding',
    'Education',
    'Healthcare',
    'Business',
    'Staff Salaries',
    'Donations',
    'Emergency Fund',
    'Car Purchase',
    'Home Appliances',
    'Investment Capital',
];

// Interest-Based Package Options
export const IB_PACKAGE_OPTIONS = {
    lockPeriods: [
        { value: 30, label: '1 Month', rate: 8 },
        { value: 90, label: '3 Months', rate: 10 },
        { value: 180, label: '6 Months', rate: 12 },
        { value: 365, label: '1 Year', rate: 15 },
        { value: 730, label: '2 Years', rate: 18 },
    ],
    compoundingFrequencies: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annually', label: 'Annually' },
    ],
    minAmount: 1000, // Minimum ₦1,000
    maxAmount: 10000000, // Maximum ₦10,000,000
};

// Package Status Colors
export const PACKAGE_STATUS_COLORS = {
    active: '#10b981',
    closed: '#6b7280',
    pending: '#f59e0b',
    matured: '#0066A1',
};

// Package Type Colors
export const PACKAGE_TYPE_COLORS = {
    DS: '#0066A1',
    IBS: '#28A745',
    SB: '#7952B3',
};

// Default Daily Savings Amount Options (in Naira)
export const DAILY_SAVINGS_AMOUNTS = [
    500, 1000, 1500, 2000, 2500, 3000, 5000, 10000
];

// Minimum and Maximum amounts for different package types
export const PACKAGE_LIMITS = {
    dailySavings: {
        min: 100,
        max: 50000,
    },
    interestBased: {
        min: 1000,
        max: 10000000,
    },
    savingsBuying: {
        min: 1000,
        max: 5000000,
    },
};
