/**
 * Cards List Screen
 * Displays all user payment cards with management options
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCardsQuery } from '@/hooks/queries/useCardsQuery';
import { StoredCard } from '@/services/api/cards';
import type { CardsScreenProps } from '@/navigation/types';

// Card Item Component with Flip Animation
function CardItem({
  card,
  index,
  onSetDefault,
  onToggleActive,
  onDelete,
}: {
  card: StoredCard;
  index: number;
  onSetDefault: (card: StoredCard) => void;
  onToggleActive: (card: StoredCard) => void;
  onDelete: (card: StoredCard) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (isFlipped) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const getCardGradient = (index: number) => {
    const colors = ['#0066A1', '#7952B3', '#28A745', '#DC3545', '#6610f2'];
    return colors[index % colors.length];
  };

  const backgroundColor = getCardGradient(index);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={flipCard}
      style={styles.cardContainer}
    >
      {/* Front of Card */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          { backgroundColor },
          frontAnimatedStyle,
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardBadges}>
            {card.isDefault && (
              <View style={styles.defaultBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
            {!card.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardType}>{card.cardType.toUpperCase()}</Text>
        </View>

        {/* Card Number */}
        <View style={styles.cardMiddle}>
          <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFourDigits}</Text>
          <Text style={styles.cardBank}>{card.bank}</Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardExpiry}>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardExpiryDate}>
              {card.expiryMonth}/{card.expiryYear}
            </Text>
          </View>
          <TouchableOpacity style={styles.flipHint} onPress={flipCard}>
            <Ionicons name="eye-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Back of Card */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          { backgroundColor },
          backAnimatedStyle,
        ]}
      >
        {/* Card Details */}
        <View style={styles.cardBackContent}>
          <View style={styles.cardDetailSection}>
            <View style={styles.cardDetailRow}>
              <Text style={styles.cardDetailLabel}>CARD NUMBER</Text>
              <Text style={styles.cardDetailValue}>{card.cardNumber}</Text>
            </View>

            <View style={styles.cardDetailRowSplit}>
              <View style={styles.cardDetailItem}>
                <Text style={styles.cardDetailLabel}>CVV</Text>
                <View style={styles.cvvContainer}>
                  <Text style={styles.cardDetailValue}>•••</Text>
                  <Text style={styles.cvvNote}>(Hidden for security)</Text>
                </View>
              </View>

              <View style={styles.cardDetailItemRight}>
                <Text style={styles.cardDetailLabel}>VALID THRU</Text>
                <Text style={styles.cardDetailValue}>
                  {card.expiryMonth}/{card.expiryYear}
                </Text>
              </View>
            </View>

            <View style={styles.cardDetailRow}>
              <Text style={styles.cardDetailLabel}>BANK</Text>
              <Text style={styles.cardDetailValueBank}>{card.bank}</Text>
            </View>
          </View>
        </View>

        {/* Actions on Back */}
        <View style={styles.cardBackActions}>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleActive(card);
            }}
          >
            <Ionicons
              name={card.isActive ? 'pause-outline' : 'play-outline'}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={(e) => {
              e.stopPropagation();
              onSetDefault(card);
            }}
            disabled={card.isDefault}
          >
            <Ionicons
              name={card.isDefault ? 'star' : 'star-outline'}
              size={20}
              color={card.isDefault ? '#FFD700' : '#ffffff'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(card);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={(e) => {
              e.stopPropagation();
              flipCard();
            }}
          >
            <Ionicons name="sync-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CardsListScreen({ navigation }: CardsScreenProps<'CardsList'>) {
  const [refreshing, setRefreshing] = useState(false);

  const {
    cards,
    hasCards,
    activeCards,
    defaultCard,
    isCardsLoading,
    isCardsError,
    refetchCards,
    deleteCard,
    setDefaultCard,
    deactivateCard,
    activateCard,
  } = useCardsQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchCards();
    setRefreshing(false);
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleDeleteCard = (card: StoredCard) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete the card ending in ${card.lastFourDigits}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCard(card._id),
        },
      ]
    );
  };

  const handleSetDefault = (card: StoredCard) => {
    if (card.isDefault) {
      Alert.alert('Info', 'This card is already your default card');
      return;
    }

    Alert.alert(
      'Set Default Card',
      `Set the card ending in ${card.lastFourDigits} as your default payment card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Default',
          onPress: () => setDefaultCard(card._id),
        },
      ]
    );
  };

  const handleToggleActive = (card: StoredCard) => {
    if (card.isActive) {
      Alert.alert(
        'Deactivate Card',
        `Deactivate the card ending in ${card.lastFourDigits}? You can reactivate it later.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deactivate',
            style: 'destructive',
            onPress: () => deactivateCard(card._id),
          },
        ]
      );
    } else {
      Alert.alert(
        'Activate Card',
        `Activate the card ending in ${card.lastFourDigits}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Activate',
            onPress: () => activateCard(card._id),
          },
        ]
      );
    }
  };

  const renderCardItem = ({ item, index }: { item: StoredCard; index: number }) => (
    <CardItem
      card={item}
      index={index}
      onSetDefault={handleSetDefault}
      onToggleActive={handleToggleActive}
      onDelete={handleDeleteCard}
    />
  );

  const handleRetry = () => {
    refetchCards();
  };

  if (isCardsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066A1" />
          <Text style={styles.loadingText}>Loading cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isCardsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC3545" />
          <Text style={styles.errorTitle}>Error Loading Cards</Text>
          <Text style={styles.errorMessage}>
            We couldn't load your cards. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cards</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Ionicons name="add-circle-outline" size={24} color="#0066A1" />
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      {hasCards && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="card-outline" size={24} color="#0066A1" />
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#28A745" />
            <Text style={styles.statValue}>{activeCards.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color="#FFD700" />
            <Text style={styles.statValue}>
              {defaultCard ? `•••• ${defaultCard.lastFourDigits}` : 'None'}
            </Text>
            <Text style={styles.statLabel}>Default</Text>
          </View>
        </View>
      )}

      {/* Cards List or Empty State */}
      {!hasCards ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No Cards Added</Text>
          <Text style={styles.emptyMessage}>
            Add your first card to start making payments
          </Text>
          <TouchableOpacity style={styles.addFirstCardButton} onPress={handleAddCard}>
            <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.addFirstCardText}>Add Your First Card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#0066A1',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    height: 200,
    marginBottom: 16,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: 200,
    borderRadius: 16,
    backfaceVisibility: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFront: {
    padding: 20,
    justifyContent: 'space-between',
  },
  cardBack: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  cardBank: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardExpiry: {
    gap: 2,
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cardExpiryDate: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  flipHint: {
    padding: 4,
  },
  cardBackContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardDetailSection: {
    gap: 12,
    marginTop: 5,
  },
  cardDetailRow: {
    marginBottom: 8,
  },
  cardDetailRowSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardDetailLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  cardDetailValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardDetailValueBank: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    maxWidth: '70%',
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cvvNote: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardBackActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 5,
  },
  cardActionButton: {
    padding: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  addFirstCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066A1',
    borderRadius: 8,
  },
  addFirstCardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});