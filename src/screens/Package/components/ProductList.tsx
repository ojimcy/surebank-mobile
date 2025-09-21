/**
 * ProductList Component
 * Displays a grid of products with infinite scroll
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/services/api/products';
import { ProductCard } from './ProductCard';

interface ProductListProps {
    products: Product[];
    selectedProduct: Product | null;
    onProductSelect: (product: Product) => void;
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onEndReached?: () => void;
    isFetchingNextPage?: boolean;
    totalResults?: number;
}

export function ProductList({
    products,
    selectedProduct,
    onProductSelect,
    isLoading = false,
    refreshing = false,
    onRefresh,
    onEndReached,
    isFetchingNextPage = false,
    totalResults = 0,
}: ProductListProps) {
    const renderProduct = useCallback(({ item }: { item: Product }) => {
        const isSelected = selectedProduct?._id === item._id;
        return (
            <ProductCard
                product={item}
                isSelected={isSelected}
                onPress={onProductSelect}
            />
        );
    }, [selectedProduct, onProductSelect]);

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#0066A1" />
                    <Text style={styles.emptyText}>Loading products...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>
                    Try a different search or check back later
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;

        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#0066A1" />
            </View>
        );
    };

    const renderHeader = () => {
        if (!totalResults || totalResults === 0) return null;

        return (
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                    {totalResults} product{totalResults !== 1 ? 's' : ''} available
                </Text>
            </View>
        );
    };

    return (
        <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#0066A1"
                    />
                ) : undefined
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
        />
    );
}

const styles = StyleSheet.create({
    productsList: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: 20,
    },
    productRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    resultsHeader: {
        paddingHorizontal: 4,
        paddingTop: 12,
        paddingBottom: 8,
    },
    resultsText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 64,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    },
    loadingMore: {
        paddingVertical: 16,
        alignItems: 'center',
    },
});