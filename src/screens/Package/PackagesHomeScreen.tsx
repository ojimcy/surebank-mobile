import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainHeader } from '@/components/navigation';
import { useAuth } from '@/contexts/AuthContext';
import packagesService, { type UIPackage } from '@/services/api/packages';
import type { PackageScreenProps } from '@/navigation/types';

type FilterType = 'all' | 'DS' | 'IBS' | 'SB';

export default function PackagesHomeScreen({ navigation }: PackageScreenProps<'PackageHome'>) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<UIPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleAvatarPress = () => {
    // Navigate to Settings screen
    navigation.getParent()?.navigate('SettingsTab', {
      screen: 'Settings',
    });
  };

  const fetchPackages = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (user?.id) {
        const apiData = await packagesService.getAllPackages();
        const uiPackages = packagesService.transformToUIPackages(apiData);
        setPackages(uiPackages);
      }
    } catch (err: any) {
      console.error('Failed to fetch packages:', err);
      setError('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [user?.id]);

  const handleRefresh = () => {
    fetchPackages(true);
  };

  const handleNewPackage = () => {
    navigation.navigate('NewPackage');
  };

  const handlePackagePress = (packageItem: UIPackage) => {
    navigation.navigate('PackageDetail', {
      packageId: packageItem.id,
      packageType: packageItem.type
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatProgress = (progress: number) => {
    return Math.min(Math.max(progress, 0), 100);
  };

  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.accountNumber.toLowerCase().includes(query) ||
        pkg.typeLabel.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [packages, selectedFilter, searchQuery]);

  const filterOptions = [
    { key: 'all' as FilterType, label: 'All', count: packages.length },
    { key: 'DS' as FilterType, label: 'Daily Savings', count: packages.filter(p => p.type === 'DS').length },
    { key: 'IBS' as FilterType, label: 'Interest-Based', count: packages.filter(p => p.type === 'IBS').length },
    { key: 'SB' as FilterType, label: 'SB Package', count: packages.filter(p => p.type === 'SB').length },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MainHeader
          onNotificationPress={handleNotificationPress}
          onAvatarPress={handleAvatarPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066A1" />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        onNotificationPress={handleNotificationPress}
        onAvatarPress={handleAvatarPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0066A1']}
            tintColor="#0066A1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>My Packages</Text>
          <Text style={styles.headerSubtitle}>
            Manage your savings and investment packages
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search packages..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View style={[
                    styles.filterBadge,
                    selectedFilter === filter.key && styles.filterBadgeActive
                  ]}>
                    <Text style={[
                      styles.filterBadgeText,
                      selectedFilter === filter.key && styles.filterBadgeTextActive
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchPackages()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Packages List */}
        {!error && filteredPackages.length > 0 && (
          <View style={styles.packagesSection}>
            {filteredPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handlePackagePress(pkg)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[pkg.color, `${pkg.color}dd`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.packageGradient}
                >
                  <View style={styles.packageHeader}>
                    <View style={styles.packageTitleSection}>
                      <Ionicons name={pkg.icon as any} size={24} color="#ffffff" />
                      <View style={styles.packageTitleText}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <Text style={styles.packageType}>{pkg.typeLabel}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: pkg.statusColor }]}>
                      <Text style={styles.statusText}>{pkg.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.packageProgress}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {formatCurrency(pkg.current)} of {formatCurrency(pkg.target)}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {formatProgress(pkg.progress).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${formatProgress(pkg.progress)}%` }
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.packageFooter}>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageInfoLabel}>Account</Text>
                      <Text style={styles.packageInfoValue}>{pkg.accountNumber}</Text>
                    </View>
                    {pkg.interestRate && (
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageInfoLabel}>Interest</Text>
                        <Text style={styles.packageInfoValue}>{pkg.interestRate}</Text>
                      </View>
                    )}
                    {pkg.amountPerDay && (
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageInfoLabel}>Daily</Text>
                        <Text style={styles.packageInfoValue}>{formatCurrency(pkg.amountPerDay)}</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!error && packages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="wallet-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyStateTitle}>No Packages Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Start your savings journey by creating your first package
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleNewPackage}>
              <LinearGradient
                colors={['#0066A1', '#0077B5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyStateButtonGradient}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.emptyStateButtonText}>Create Package</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty Search Results */}
        {!error && packages.length > 0 && filteredPackages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="search" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyStateTitle}>No Packages Found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery ? `No packages matching "${searchQuery}"` : `No ${selectedFilter === 'all' ? '' : selectedFilter} packages found`}
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
            >
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewPackage} activeOpacity={0.8}>
        <LinearGradient
          colors={['#0066A1', '#0077B5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerSection: {
    padding: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginTop: 12,
    marginHorizontal: -24,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#0066A1',
    borderColor: '#0066A1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBadgeTextActive: {
    color: '#ffffff',
  },
  errorContainer: {
    margin: 24,
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  packagesSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  packageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  packageGradient: {
    padding: 20,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  packageTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packageTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  packageType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  packageProgress: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageInfo: {
    alignItems: 'center',
  },
  packageInfoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  packageInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyStateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 16,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});