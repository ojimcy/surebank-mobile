/**
 * Transaction History Screen
 *
 * Displays all user transactions with filtering and search capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery';
import { TransactionFilters } from '@/services/api/transactions';
import { HistoryStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<HistoryStackParamList>;
type DateRangeOption = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | Date | number): string => {
  const date = typeof dateString === 'string' || typeof dateString === 'number' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string | Date | number): string => {
  const date = typeof dateString === 'string' || typeof dateString === 'number' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function TransactionHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filter states
  const [transactionType, setTransactionType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({
    page: currentPage,
    limit: pageSize,
  });

  // Calculate date range timestamps
  const getDateRangeTimestamps = useCallback((option: DateRangeOption): { startDate?: number; endDate?: number } => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    switch (option) {
      case 'today': {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return {
          startDate: startOfDay.getTime(),
          endDate: endOfDay.getTime(),
        };
      }
      case 'week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return {
          startDate: startOfWeek.getTime(),
          endDate: endOfDay.getTime(),
        };
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return {
          startDate: startOfMonth.getTime(),
          endDate: endOfDay.getTime(),
        };
      }
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        return {
          startDate: startOfYear.getTime(),
          endDate: endOfDay.getTime(),
        };
      }
      case 'custom': {
        const startDate = customStartDate ? new Date(customStartDate) : undefined;
        const endDate = customEndDate ? new Date(customEndDate) : undefined;

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        return {
          startDate: startDate?.getTime(),
          endDate: endDate?.getTime(),
        };
      }
      default:
        return {};
    }
  }, [customStartDate, customEndDate]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const dateFilters = getDateRangeTimestamps(dateRange);
    const directionFilter = transactionType !== 'all' ? transactionType : undefined;

    setCurrentPage(1);
    setAppliedFilters({
      page: 1,
      limit: pageSize,
      direction: directionFilter,
      ...dateFilters,
    });
    setShowFilterModal(false);
  }, [dateRange, transactionType, pageSize, getDateRangeTimestamps]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setTransactionType('all');
    setDateRange('all');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setCurrentPage(1);
    setAppliedFilters({ page: 1, limit: pageSize });
    setShowFilterModal(false);
  }, [pageSize]);

  // Update filters when page changes
  useEffect(() => {
    setAppliedFilters(prev => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  // Fetch transactions
  const {
    transactions,
    pagination,
    isLoading,
    refetchTransactions: refetch,
    isError,
  } = useTransactionsQuery(appliedFilters);

  const isRefetching = false; // Hook doesn't provide this directly

  // Handle transaction press
  const handleTransactionPress = useCallback((transactionId: string) => {
    navigation.navigate('TransactionDetail', { transactionId });
  }, [navigation]);

  // Load more for pagination
  const handleLoadMore = useCallback(() => {
    if (!isLoading && pagination && currentPage < pagination.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, pagination, currentPage]);

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: any }) => {
    // Handle date properly - it's a number (Unix timestamp in milliseconds)
    const transactionDate = new Date(item.date || item.createdAt);

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item._id || item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              item.direction === 'inflow' ? styles.inflowIcon : styles.outflowIcon,
            ]}
          >
            <Ionicons
              name={item.direction === 'inflow' ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={20}
              color={item.direction === 'inflow' ? '#28A745' : '#DC3545'}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {item.transactionType || (item.direction === 'inflow' ? 'Deposit' : 'Withdrawal')}
            </Text>
            <Text style={styles.transactionCategory} numberOfLines={1}>
              {item.narration || 'Transaction'}
            </Text>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              item.direction === 'inflow' ? styles.positiveAmount : styles.negativeAmount,
            ]}
          >
            {item.direction === 'inflow' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.transactionDateTime}>
            {formatDate(transactionDate)}, {formatTime(transactionDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptySubtitle}>
        {transactionType !== 'all' || dateRange !== 'all'
          ? 'Try adjusting your filters'
          : "You don't have any transactions yet"}
      </Text>
      {(transactionType !== 'all' || dateRange !== 'all') && (
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render footer loading
  const renderFooterLoading = () => {
    if (!isLoading || currentPage === 1) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#0066A1" />
      </View>
    );
  };

  // Filter Modal Content
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Transaction Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Transaction Type</Text>
              <View style={styles.filterOptions}>
                {(['all', 'inflow', 'outflow'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      transactionType === type && styles.filterOptionActive,
                    ]}
                    onPress={() => setTransactionType(type)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        transactionType === type && styles.filterOptionTextActive,
                      ]}
                    >
                      {type === 'all' ? 'All' : type === 'inflow' ? 'Deposits' : 'Withdrawals'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterOptions}>
                {(['all', 'today', 'week', 'month', 'year', 'custom'] as const).map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      dateRange === range && styles.filterOptionActive,
                    ]}
                    onPress={() => setDateRange(range)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        dateRange === range && styles.filterOptionTextActive,
                      ]}
                    >
                      {range === 'all'
                        ? 'All Time'
                        : range === 'week'
                        ? 'This Week'
                        : range === 'month'
                        ? 'This Month'
                        : range === 'year'
                        ? 'This Year'
                        : range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Custom Date Range</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker('start')}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text style={styles.dateInputText}>
                    {customStartDate ? formatDate(customStartDate) : 'Start Date'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateInput, { marginTop: 12 }]}
                  onPress={() => setShowDatePicker('end')}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text style={styles.dateInputText}>
                    {customEndDate ? formatDate(customEndDate) : 'End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={resetFilters}>
              <Text style={styles.modalButtonTextSecondary}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={applyFilters}
            >
              <Text style={styles.modalButtonTextPrimary}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with filter button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter-outline" size={20} color="#0066A1" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Active filters */}
      {(transactionType !== 'all' || dateRange !== 'all') && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {transactionType !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {transactionType === 'inflow' ? 'Deposits' : 'Withdrawals'}
                </Text>
              </View>
            )}
            {dateRange !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {dateRange === 'custom'
                    ? `${customStartDate ? formatDate(customStartDate) : 'Any'} - ${
                        customEndDate ? formatDate(customEndDate) : 'Any'
                      }`
                    : dateRange === 'today'
                    ? 'Today'
                    : dateRange === 'week'
                    ? 'This Week'
                    : dateRange === 'month'
                    ? 'This Month'
                    : 'This Year'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.clearChip} onPress={resetFilters}>
              <Text style={styles.clearChipText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Transactions List */}
      {isLoading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066A1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooterLoading}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Date Picker */}
      {showDatePicker && (Platform.OS === 'ios' ? (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  showDatePicker === 'start'
                    ? customStartDate || new Date()
                    : customEndDate || new Date()
                }
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (showDatePicker === 'start') {
                    setCustomStartDate(selectedDate);
                  } else {
                    setCustomEndDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        <DateTimePicker
          value={
            showDatePicker === 'start'
              ? customStartDate || new Date()
              : customEndDate || new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (showDatePicker === 'start') {
              setCustomStartDate(selectedDate);
            } else {
              setCustomEndDate(selectedDate);
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#0066A1',
    fontWeight: '500',
  },
  activeFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: '#0066A1',
    fontWeight: '500',
  },
  clearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 16,
  },
  clearChipText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inflowIcon: {
    backgroundColor: '#e8f5e8',
  },
  outflowIcon: {
    backgroundColor: '#fff0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#6b7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  positiveAmount: {
    color: '#28A745',
  },
  negativeAmount: {
    color: '#DC3545',
  },
  transactionDateTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterOptionActive: {
    backgroundColor: '#0066A1',
    borderColor: '#0066A1',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  dateInputText: {
    fontSize: 14,
    color: '#374151',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalButtonPrimary: {
    backgroundColor: '#0066A1',
    borderColor: '#0066A1',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  // Date Picker Modal Styles (iOS)
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#0066A1',
    fontWeight: '500',
  },
});