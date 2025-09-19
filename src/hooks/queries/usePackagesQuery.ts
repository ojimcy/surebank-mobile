/**
 * usePackagesQuery Hook
 *
 * React Query hook for managing savings packages data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  IBPackage,
} from '@/services/api/packages';
import { useAuth } from '@/contexts/AuthContext';
import type { SavingsPackage } from '@/components/dashboard/types';

// Package type colors
const packageColors = {
  ds: '#0066A1',
  sb: '#7952B3',
  ibs: '#28A745',
};

// Package type icons
const packageIcons = {
  ds: 'calendar',
  sb: 'shopping-bag',
  ibs: 'trending-up',
} as const;

export function usePackagesQuery() {
  const { user } = useAuth();

  // Fetch all packages
  const {
    data: packagesData,
    isLoading,
    isError,
    error,
    refetch: refetchPackages,
  } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getAllPackages(),
    enabled: !!user, // Enable when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Transform packages for UI display
  const transformedPackages = useMemo(() => {
    if (!packagesData) return [];

    const { dailySavings = [], sbPackages = [], ibPackages = [] } = packagesData;

    // Transform Daily Savings packages
    const dsPackages: SavingsPackage[] = dailySavings
      .filter(pkg => pkg.status === 'active' || pkg.status === 'Active')
      .map((pkg: DailySavingsPackage) => ({
        id: pkg.id,
        title: pkg.target || 'Daily Savings',
        type: 'ds',
        icon: packageIcons.ds,
        progress: Math.min(100, Math.floor((pkg.totalContribution / pkg.targetAmount) * 100)),
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        amountPerDay: pkg.amountPerDay,
        totalContribution: pkg.totalContribution,
        color: packageColors.ds,
        status: 'active' as const,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      }));

    // Transform SB packages
    const sbMappedPackages: SavingsPackage[] = sbPackages
      .filter(pkg => pkg.status === 'active' || pkg.status === 'Active')
      .map((pkg: SBPackage) => ({
        id: pkg._id,
        title: pkg.product?.name || 'SureBank Package',
        type: 'sb',
        icon: packageIcons.sb,
        progress:
          pkg.targetAmount > 0
            ? Math.min(100, Math.floor((pkg.totalContribution / pkg.targetAmount) * 100))
            : 0,
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        totalContribution: pkg.totalContribution,
        color: packageColors.sb,
        status: 'active' as const,
        createdAt: pkg.startDate,
        updatedAt: pkg.startDate,
      }));

    // Transform Interest-Based packages
    const ibMappedPackages: SavingsPackage[] = ibPackages
      .filter(pkg => pkg.status === 'active' || pkg.status === 'Active')
      .map((pkg: IBPackage) => {
        // Calculate time-based progress
        const start = new Date(pkg.startDate || pkg.createdAt).getTime();
        const end = new Date(pkg.maturityDate).getTime();
        const now = Date.now();

        let timeProgress = 0;
        if (now >= start && now <= end) {
          const totalDuration = end - start;
          const elapsed = now - start;
          timeProgress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
        } else if (now > end) {
          timeProgress = 100;
        }

        return {
          id: pkg._id || pkg.id || '',
          title: pkg.name || 'Interest Savings',
          type: 'ibs',
          icon: packageIcons.ibs,
          progress: timeProgress,
          current: pkg.currentBalance || pkg.principalAmount || 0,
          target: 0, // IB packages don't have a target
          totalContribution: pkg.principalAmount || 0,
          color: packageColors.ibs,
          status: 'active' as const,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        };
      });

    // Combine all packages
    return [...dsPackages, ...sbMappedPackages, ...ibMappedPackages];
  }, [packagesData]);

  // Get active packages count
  const activePackagesCount = transformedPackages.length;

  // Get total contributions
  const totalContributions = transformedPackages.reduce(
    (sum, pkg) => sum + (pkg.totalContribution || 0),
    0
  );

  return {
    // Data
    packages: transformedPackages,
    packagesData,
    activePackagesCount,
    totalContributions,

    // Status
    isLoading,
    isError,
    error,
    hasPackages: transformedPackages.length > 0,

    // Actions
    refetchPackages,
  };
}