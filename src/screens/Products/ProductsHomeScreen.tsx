/**
 * Products Home Screen
 * Main products browsing interface
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import productsService, { Product, Category, PaginatedResponse } from '@/services/api/products';
import { ProductList, CategoryFilter, SearchBar } from '@/screens/Package/components';
import MainHeader from '@/components/navigation/MainHeader';
import type { ProductsStackNavigationProp } from '@/navigation/types';

export default function ProductsHomeScreen() {
    const navigation = useNavigation<ProductsStackNavigationProp<'ProductsHome'>>();

    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['productCategories'],
        queryFn: () => productsService.getCategories(),
    });

    // Fetch products with infinite scroll
    const {
        data: productData,
        isLoading: isProductsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchProducts,
    } = useInfiniteQuery<PaginatedResponse<Product>>({
        queryKey: ['products', selectedCategory, searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const page = Number(pageParam);
            if (searchQuery) {
                return productsService.searchProducts(searchQuery, page, 20);
            }
            if (selectedCategory) {
                return productsService.getProductsByCategory(selectedCategory, page, 20);
            }
            return productsService.getSBProducts(page, 20);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
        },
    });

    const allProducts = productData?.pages.flatMap((page) => page.results) || [];
    const totalResults = productData?.pages[0]?.totalResults || 0;

    // Handle product selection - navigate to detail screen
    const handleProductSelect = (product: Product) => {
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        refetchProducts().finally(() => setRefreshing(false));
    }, [refetchProducts]);

    // Load more products
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleNotificationPress = () => {
        // Navigate to notifications screen
        console.log('Navigate to notifications');
    };

    const handleAvatarPress = () => {
        // Navigate to profile/settings
        console.log('Navigate to profile');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Main Header */}
                <MainHeader
                    onNotificationPress={handleNotificationPress}
                    onAvatarPress={handleAvatarPress}
                />

                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search products..."
                />

                {/* Categories Filter */}
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* Products List */}
                <ProductList
                    products={allProducts}
                    selectedProduct={null}
                    onProductSelect={handleProductSelect}
                    isLoading={isProductsLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onEndReached={loadMore}
                    isFetchingNextPage={isFetchingNextPage}
                    totalResults={totalResults}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
});