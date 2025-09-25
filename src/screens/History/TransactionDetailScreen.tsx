/**
 * Transaction Detail Screen
 *
 * Displays detailed information about a specific transaction
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSingleTransactionQuery } from '@/hooks/queries/useTransactionsQuery';
import { HistoryStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<HistoryStackParamList, 'TransactionDetail'>;
type NavigationProp = NativeStackNavigationProp<HistoryStackParamList>;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status?: string): { bg: string; text: string } => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'pending':
      return { bg: '#fef3c7', text: '#d97706' };
    case 'failed':
    case 'error':
      return { bg: '#fee2e2', text: '#dc2626' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export default function TransactionDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { transactionId } = route.params;

  const { data: transaction, isLoading, error } = useSingleTransactionQuery(transactionId);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        'Unable to load transaction details. Please try again.',
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    }
  }, [error, navigation]);

  const handleShare = async () => {
    if (!transaction) return;

    try {
      const message = `Transaction Details
${transaction.direction === 'inflow' ? 'Received' : 'Sent'}: ${formatCurrency(transaction.amount)}
Date: ${formatDate(transaction.date || transaction.createdAt)}
Time: ${formatTime(transaction.date || transaction.createdAt)}
Status: ${transaction.status || 'Completed'}
Transaction ID: ${transaction._id || transaction.id}
Narration: ${transaction.narration}`;

      await Share.share({
        message,
        title: 'Transaction Details',
      });
    } catch (error) {
      console.error('Error sharing transaction:', error);
    }
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      'Download Receipt',
      'Receipt download functionality will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Please contact customer support to report any issues with this transaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => navigation.navigate('Support' as any) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066A1" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Transaction Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The transaction you're looking for could not be found.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColor(transaction.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Transaction Status Card */}
      <View style={styles.statusCard}>
        <View
          style={[
            styles.statusIcon,
            transaction.direction === 'inflow'
              ? styles.inflowIcon
              : styles.outflowIcon,
          ]}
        >
          <Ionicons
            name={transaction.direction === 'inflow' ? 'arrow-down' : 'arrow-up'}
            size={32}
            color={transaction.direction === 'inflow' ? '#16a34a' : '#dc2626'}
          />
        </View>

        <Text style={styles.statusTitle}>
          {transaction.direction === 'inflow' ? 'Money Received' : 'Money Sent'}
        </Text>

        <Text
          style={[
            styles.statusAmount,
            transaction.direction === 'inflow'
              ? styles.positiveAmount
              : styles.negativeAmount,
          ]}
        >
          {transaction.direction === 'inflow' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>

        {transaction.status && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.bg },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {transaction.status}
            </Text>
          </View>
        )}
      </View>

      {/* Transaction Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Transaction Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transaction Type</Text>
          <Text style={styles.infoValue}>
            {transaction.transactionType ||
             (transaction.direction === 'inflow' ? 'Deposit' : 'Withdrawal')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{formatDate(transaction.date || transaction.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{formatTime(transaction.date || transaction.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transaction ID</Text>
          <Text style={[styles.infoValue, styles.monoText]} numberOfLines={1}>
            {transaction._id || transaction.id}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reference</Text>
          <Text style={[styles.infoValue, styles.monoText]} numberOfLines={1}>
            {transaction.reference || transaction._id || transaction.id}
          </Text>
        </View>

        {transaction.accountNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account</Text>
            <Text style={styles.infoValue}>{transaction.accountNumber}</Text>
          </View>
        )}

        {transaction.penaltyAmount > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Penalty Amount</Text>
            <Text style={[styles.infoValue, styles.negativeAmount]}>
              {formatCurrency(transaction.penaltyAmount)}
            </Text>
          </View>
        )}

        {transaction.bankName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank</Text>
            <Text style={styles.infoValue}>{transaction.bankName}</Text>
          </View>
        )}

        {transaction.bankAccountNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank Account</Text>
            <Text style={styles.infoValue}>{transaction.bankAccountNumber}</Text>
          </View>
        )}

        {transaction.bankAccountName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.infoValue}>{transaction.bankAccountName}</Text>
          </View>
        )}
      </View>

      {/* Description/Narration */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {transaction.narration || 'No description available'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#0066A1" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadReceipt}>
          <Ionicons name="download-outline" size={20} color="#0066A1" />
          <Text style={styles.actionButtonText}>Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReportIssue}>
          <Ionicons name="flag-outline" size={20} color="#0066A1" />
          <Text style={styles.actionButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <Text style={styles.primaryButtonText}>View All Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Dashboard' as any)}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  inflowIcon: {
    backgroundColor: '#dcfce7',
  },
  outflowIcon: {
    backgroundColor: '#fee2e2',
  },
  statusTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  positiveAmount: {
    color: '#16a34a',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  descriptionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#0066A1',
    marginTop: 4,
  },
  bottomActions: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#0066A1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 32,
  },
});