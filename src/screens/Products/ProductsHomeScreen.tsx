/**
 * Products Home Screen
 * Main products browsing interface
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Modal,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import productsService, { Product, Category, PaginatedResponse } from '@/services/api/products';
import { ProductList, CategoryFilter, SearchBar } from '@/screens/Package/components';
import MainHeader from '@/components/navigation/MainHeader';
import { Button } from '@/components/forms/Button';
import type { ProductsStackNavigationProp } from '@/navigation/types';

export default function ProductsHomeScreen() {
    const navigation = useNavigation<ProductsStackNavigationProp<'ProductsHome'>>();

    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
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

    // Handle product selection
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };

    // Handle package creation
    const handleConfirmCreate = () => {
        if (!selectedProduct) return;
        setShowConfirmModal(false);
        navigation.navigate('CreateSBPackage', { productId: selectedProduct._id });
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
                    selectedProduct={selectedProduct}
                    onProductSelect={handleProductSelect}
                    isLoading={isProductsLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onEndReached={loadMore}
                    isFetchingNextPage={isFetchingNextPage}
                    totalResults={totalResults}
                />

                {/* Confirmation Modal */}
                <Modal
                    visible={showConfirmModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowConfirmModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>

                            {selectedProduct && (
                                <>
                                    <View style={styles.modalHeader}>
                                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                            <Image
                                                source={{ uri: selectedProduct.images[0] }}
                                                style={styles.modalProductImage}
                                            />
                                        ) : (
                                            <View style={styles.modalProductImagePlaceholder}>
                                                <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.modalBody}>
                                        <Text style={styles.modalTitle}>Product Details</Text>
                                        <Text style={styles.modalProductName}>{selectedProduct.name}</Text>

                                        {selectedProduct.description && (
                                            <Text style={styles.modalProductDescription}>
                                                {selectedProduct.description}
                                            </Text>
                                        )}

                                        <View style={styles.modalPriceContainer}>
                                            <Text style={styles.modalPriceLabel}>Price</Text>
                                            <Text style={styles.modalPriceValue}>
                                                ₦{(selectedProduct.sellingPrice || selectedProduct.price || 0).toLocaleString()}
                                            </Text>
                                        </View>

                                        <View style={styles.modalInfoCard}>
                                            <Ionicons name="information-circle-outline" size={18} color="#0066A1" />
                                            <Text style={styles.modalInfoText}>
                                                Create a savings package for this product and save towards it at your own pace.
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Button
                                                title="Cancel"
                                                onPress={() => setShowConfirmModal(false)}
                                                variant="outline"
                                                size="md"
                                                fullWidth
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Button
                                                title="Create Package"
                                                onPress={handleConfirmCreate}
                                                variant="primary"
                                                size="md"
                                                leftIcon="add-circle"
                                                fullWidth
                                            />
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 4,
    },
    modalHeader: {
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingVertical: 20,
    },
    modalProductImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    modalProductImagePlaceholder: {
        width: 120,
        height: 120,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalProductName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalProductDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalPriceContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    modalPriceLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    modalPriceValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0066A1',
    },
    modalInfoCard: {
        flexDirection: 'row',
        backgroundColor: '#e6f2ff',
        borderRadius: 8,
        padding: 12,
        alignItems: 'flex-start',
    },
    modalInfoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#0066A1',
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
});