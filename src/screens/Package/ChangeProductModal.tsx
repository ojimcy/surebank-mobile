/**
 * Change Product Modal
 * Allows users to change the product associated with an SB package
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    TextInput,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import packagesService from '@/services/api/packages';
import productsService, { type Product } from '@/services/api/products';

interface ChangeProductModalProps {
    visible: boolean;
    onClose: () => void;
    packageId: string;
    currentProduct?: {
        name: string;
        price?: number;
        images?: string[];
    };
    onSuccess: () => void;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

export default function ChangeProductModal({
    visible,
    onClose,
    packageId,
    currentProduct,
    onSuccess,
}: ChangeProductModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchProducts();
        }
    }, [visible]);

    useEffect(() => {
        // Filter products based on search query
        if (searchQuery.trim()) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsService.getSBProducts(1, 50);
            setProducts(response.results);
            setFilteredProducts(response.results);
            setHasMore(response.page < response.totalPages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeProduct = async () => {
        if (!selectedProductId) {
            Alert.alert('No Selection', 'Please select a product');
            return;
        }

        const selectedProduct = products.find(p => p._id === selectedProductId);
        if (!selectedProduct) return;

        Alert.alert(
            'Confirm Change',
            `Are you sure you want to change the product to "${selectedProduct.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await packagesService.updatePackageProduct(
                                packageId,
                                selectedProductId
                            );
                            Alert.alert('Success', 'Product changed successfully');
                            onSuccess();
                            onClose();
                        } catch (error: any) {
                            console.error('Failed to change product:', error);
                            Alert.alert(
                                'Error',
                                error?.response?.data?.message || 'Failed to change product'
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Change Product</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Current Product Info */}
                {currentProduct && (
                    <View style={styles.currentProductContainer}>
                        <Text style={styles.currentProductLabel}>Current Product:</Text>
                        <View style={styles.currentProductInfo}>
                            {currentProduct.images?.[0] && (
                                <Image
                                    source={{ uri: currentProduct.images[0] }}
                                    style={styles.currentProductImage}
                                />
                            )}
                            <View style={styles.currentProductDetails}>
                                <Text style={styles.currentProductName}>
                                    {currentProduct.name}
                                </Text>
                                {currentProduct.price && (
                                    <Text style={styles.currentProductPrice}>
                                        {formatCurrency(currentProduct.price)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9ca3af"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7952B3" />
                        <Text style={styles.loadingText}>Loading products...</Text>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>No Products Found</Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'No products available at this time'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Product List */}
                        <ScrollView style={styles.scrollView}>
                            {filteredProducts.map(product => (
                                <TouchableOpacity
                                    key={product._id}
                                    style={[
                                        styles.productItem,
                                        selectedProductId === product._id &&
                                            styles.productItemSelected,
                                    ]}
                                    onPress={() => setSelectedProductId(product._id)}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedProductId === product._id && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>

                                    {product.images?.[0] && (
                                        <Image
                                            source={{ uri: product.images[0] }}
                                            style={styles.productImage}
                                        />
                                    )}

                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                        {product.description && (
                                            <Text style={styles.productDescription} numberOfLines={1}>
                                                {product.description}
                                            </Text>
                                        )}
                                        <Text style={styles.productPrice}>
                                            {formatCurrency(product.price)}
                                        </Text>
                                    </View>

                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={submitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.changeButton,
                                    (!selectedProductId || submitting) &&
                                        styles.changeButtonDisabled,
                                ]}
                                onPress={handleChangeProduct}
                                disabled={!selectedProductId || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.changeButtonText}>Change Product</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    currentProductContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    currentProductLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
        fontWeight: '500',
    },
    currentProductInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentProductImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f3f4f6',
    },
    currentProductDetails: {
        flex: 1,
    },
    currentProductName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    currentProductPrice: {
        fontSize: 14,
        color: '#7952B3',
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        padding: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 8,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    productItemSelected: {
        borderColor: '#7952B3',
        backgroundColor: '#f9f7ff',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#7952B3',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7952B3',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    changeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#7952B3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    changeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});