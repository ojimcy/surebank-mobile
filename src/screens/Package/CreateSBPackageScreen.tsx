/**
 * Create SB Package Screen
 * Professional form for creating SB packages
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import type { PackageScreenProps } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import packagesService, { CreateSBPackageParams } from '@/services/api/packages';
import productsService, { Product, Category, PaginatedResponse } from '@/services/api/products';
import accountsService from '@/services/api/accounts';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/forms/Button';
import { ProductList, CategoryFilter, SearchBar } from './components';

export default function CreateSBPackageScreen({ navigation, route }: PackageScreenProps<'CreateSBPackage'>) {
    // Get pre-selected product ID from navigation params if any
    const preSelectedProductId = route?.params?.productId;

    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Check if user has SB account
    const { data: hasAccount, isLoading: checkingAccount, refetch: refetchAccount } = useQuery({
        queryKey: ['check-account', 'sb'],
        queryFn: () => packagesService.checkAccountType('sb'),
    });

    // Create SB account mutation
    const createAccountMutation = useMutation({
        mutationFn: () => accountsService.createAccount('sb'),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'Your SB account has been created successfully',
            });
            refetchAccount();
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Failed to Create Account',
                text2: error?.message || 'Something went wrong',
            });
        },
    });

    // Fetch categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['productCategories'],
        queryFn: () => productsService.getCategories(),
        enabled: hasAccount === true,
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
        enabled: hasAccount === true,
    });

    const allProducts = productData?.pages.flatMap((page) => page.results) || [];
    const totalResults = productData?.pages[0]?.totalResults || 0;

    // Effect to handle pre-selected product
    useEffect(() => {
        if (preSelectedProductId && hasAccount === true && productData?.pages) {
            const findAndSelectProduct = () => {
                for (const page of productData.pages) {
                    const product = page.results.find((p) => p._id === preSelectedProductId);
                    if (product) {
                        setSelectedProduct(product);
                        break;
                    }
                }
            };
            findAndSelectProduct();
        }
    }, [preSelectedProductId, productData, hasAccount]);

    // Create package mutation
    const createPackageMutation = useMutation({
        mutationFn: (data: CreateSBPackageParams) => packagesService.createSBPackage(data),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Package Created',
                text2: 'Your SB package has been created successfully',
                visibilityTime: 3000,
            });
            navigation.navigate('PackageHome');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || 'Failed to create package';
            Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: message,
            });
        },
    });

    // Handle product selection
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };

    // Handle package creation
    const handleConfirmCreate = () => {
        if (!selectedProduct) return;

        const packageData: CreateSBPackageParams = {
            product: selectedProduct._id,
            targetAmount: selectedProduct.sellingPrice || selectedProduct.price,
        };

        createPackageMutation.mutate(packageData);
        setShowConfirmModal(false);
    };

    // Handle account creation
    const handleCreateAccount = () => {
        Alert.alert(
            'Create SB Account',
            'You need to have an SB account to create packages. Would you like to create one now?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => navigation.goBack(),
                },
                {
                    text: 'Create Account',
                    onPress: () => createAccountMutation.mutate(),
                },
            ]
        );
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


    // Loading state
    if (checkingAccount) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066A1" />
                <Text style={styles.loadingText}>Checking account status...</Text>
            </View>
        );
    }

    // No account state
    if (hasAccount === false) {
        return (
            <View style={styles.container}>
                <View style={styles.noAccountContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-circle" size={64} color="#ef4444" />
                    </View>
                    <Text style={styles.noAccountTitle}>SB Account Required</Text>
                    <Text style={styles.noAccountText}>
                        You need to have an SB account before creating a package.
                    </Text>
                    <Button
                        title="Create SB Account"
                        onPress={handleCreateAccount}
                        loading={createAccountMutation.isPending}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="add-circle"
                    />
                    <Button
                        title="Go Back"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                        size="md"
                        fullWidth
                        leftIcon="arrow-back"
                        disabled={createAccountMutation.isPending}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                                    <Text style={styles.modalTitle}>Create SB Package</Text>
                                    <Text style={styles.modalProductName}>{selectedProduct.name}</Text>

                                    {selectedProduct.description && (
                                        <Text style={styles.modalProductDescription}>
                                            {selectedProduct.description}
                                        </Text>
                                    )}

                                    <View style={styles.modalPriceContainer}>
                                        <Text style={styles.modalPriceLabel}>Target Amount</Text>
                                        <Text style={styles.modalPriceValue}>
                                            ₦{(selectedProduct.sellingPrice || selectedProduct.price || 0).toLocaleString()}
                                        </Text>
                                    </View>

                                    <View style={styles.modalInfoCard}>
                                        <Ionicons name="information-circle-outline" size={18} color="#0066A1" />
                                        <Text style={styles.modalInfoText}>
                                            You can save any amount towards this product. Once you reach the target amount, you can claim your product.
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
                                            leftIcon="checkmark"
                                            loading={createPackageMutation.isPending}
                                            disabled={createPackageMutation.isPending}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    },
    noAccountContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    noAccountTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    noAccountText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 32,
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
