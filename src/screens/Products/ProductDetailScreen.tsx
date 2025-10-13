/**
 * Product Detail Screen
 * Full-screen detailed view of a product with image gallery and comprehensive information
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ProductsScreenProps } from '@/navigation/types';
import productsService from '@/services/api/products';
import packagesService, { CreateSBPackageParams } from '@/services/api/packages';
import accountsService from '@/services/api/accounts';
import { Button } from '@/components/forms/Button';
import { CreatePackageModal } from '@/screens/Package/components/CreatePackageModal';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.8; // 80% of screen width

type ProductDetailScreenNavigationProp = ProductsScreenProps<'ProductDetail'>['navigation'];
type ProductDetailScreenRouteProp = ProductsScreenProps<'ProductDetail'>['route'];

export default function ProductDetailScreen() {
    const navigation = useNavigation<ProductDetailScreenNavigationProp>();
    const route = useRoute<ProductDetailScreenRouteProp>();
    const { productId } = route.params;

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Fetch product details
    const {
        data: product,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsService.getProductById(productId),
    });

    // Check if user has SB account
    const { data: hasAccount, refetch: refetchAccount } = useQuery({
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
            // Show modal after account is created
            setShowCreateModal(true);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Failed to Create Account',
                text2: error?.message || 'Something went wrong',
            });
        },
    });

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
            setShowCreateModal(false);
            // Navigate to package home to see the new package
            navigation.navigate('Package' as any);
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

    const handleImageScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
        setActiveImageIndex(currentIndex);
    };

    const handleThumbnailPress = (index: number) => {
        setActiveImageIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * SCREEN_WIDTH,
            animated: true,
        });
    };

    const handleImagePress = (imageUri: string) => {
        // Navigate to full-screen image viewer
        navigation.navigate('ImageViewer' as any, { imageUri });
    };

    const handleCreatePackage = () => {
        if (!product) return;

        // Check if user has SB account
        if (hasAccount === false) {
            Alert.alert(
                'Create SB Account',
                'You need to have an SB account to create packages. Would you like to create one now?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Create Account',
                        onPress: () => createAccountMutation.mutate(),
                    },
                ]
            );
            return;
        }

        // Show the confirmation modal
        setShowCreateModal(true);
    };

    const handleConfirmCreate = () => {
        if (!product) return;

        const packageData: CreateSBPackageParams = {
            product: product._id,
            targetAmount: product.sellingPrice || product.price,
        };

        createPackageMutation.mutate(packageData);
    };

    const handleInstantCheckout = () => {
        // TODO: Implement instant checkout flow
        // This will allow users to purchase the product directly without creating a savings package
        Alert.alert(
            'Coming Soon',
            'Instant checkout feature will be available soon. You can purchase products directly without creating a savings package.',
            [{ text: 'OK' }]
        );
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066A1" />
                    <Text style={styles.loadingText}>Loading product details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorText}>Failed to load product</Text>
                    <Text style={styles.errorSubtext}>Please try again later</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const images = product.images || [];
    const hasMultipleImages = images.length > 1;
    const displayPrice = product.sellingPrice || product.price || 0;
    const hasDiscount = product.discount && product.discount > 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Image Gallery */}
                <View style={styles.imageGalleryContainer}>
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={handleImageScroll}
                                scrollEventThrottle={16}
                            >
                                {images.map((imageUri, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.9}
                                        onPress={() => handleImagePress(imageUri)}
                                    >
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Image Indicators */}
                            {hasMultipleImages && (
                                <View style={styles.imageIndicatorContainer}>
                                    {images.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.imageIndicator,
                                                activeImageIndex === index &&
                                                    styles.imageIndicatorActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* Image Counter */}
                            {hasMultipleImages && (
                                <View style={styles.imageCounter}>
                                    <Text style={styles.imageCounterText}>
                                        {activeImageIndex + 1} / {images.length}
                                    </Text>
                                </View>
                            )}

                            {/* Tap to enlarge hint */}
                            <View style={styles.enlargeHint}>
                                <Ionicons name="expand-outline" size={16} color="white" />
                                <Text style={styles.enlargeHintText}>Tap to enlarge</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={80} color="#d1d5db" />
                            <Text style={styles.imagePlaceholderText}>No image available</Text>
                        </View>
                    )}
                </View>

                {/* Thumbnail Gallery */}
                {hasMultipleImages && (
                    <View style={styles.thumbnailContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.thumbnailScroll}
                        >
                            {images.map((imageUri, index) => (
                                <View
                                    key={index}
                                    style={styles.thumbnailWrapper}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.thumbnail,
                                            activeImageIndex === index && styles.thumbnailActive,
                                        ]}
                                        onPress={() => handleThumbnailPress(index)}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.thumbnailImage}
                                            resizeMode="cover"
                                        />
                                        {activeImageIndex === index && (
                                            <View style={styles.thumbnailOverlay}>
                                                <View style={styles.thumbnailCheckmark}>
                                                    <Ionicons name="checkmark" size={16} color="white" />
                                                </View>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Product Details */}
                <ScrollView
                    style={styles.detailsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.detailsContent}
                >
                    {/* Product Name */}
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Category */}
                    {product.categoryName && (
                        <View style={styles.categoryBadge}>
                            <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
                            <Text style={styles.categoryText}>{product.categoryName}</Text>
                        </View>
                    )}

                    {/* Price Section */}
                    <View style={styles.priceContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.price}>{formatCurrency(displayPrice)}</Text>
                        </View>
                        {hasDiscount && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                    {product.discount}% OFF
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Availability Status */}
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusBadge,
                                product.isAvailable
                                    ? styles.statusAvailable
                                    : styles.statusUnavailable,
                            ]}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    product.isAvailable
                                        ? styles.statusDotAvailable
                                        : styles.statusDotUnavailable,
                                ]}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    product.isAvailable
                                        ? styles.statusTextAvailable
                                        : styles.statusTextUnavailable,
                                ]}
                            >
                                {product.isAvailable ? 'Available' : 'Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {product.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <View style={styles.tagsRow}>
                                {product.tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color="#0066A1"
                        />
                        <Text style={styles.infoCardText}>
                            Create a savings package for this product and save towards it at your
                            own pace. You can set your target date and contribution frequency.
                        </Text>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>

                {/* Fixed Bottom Action */}
                <View style={styles.bottomAction}>
                    <View style={styles.bottomPriceContainer}>
                        <Text style={styles.bottomPriceLabel}>Total Price</Text>
                        <Text style={styles.bottomPrice}>{formatCurrency(displayPrice)}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.bottomButtonsRow}>
                        <View style={styles.buttonHalfLeft}>
                            <Button
                                title="Buy Now"
                                onPress={handleInstantCheckout}
                                variant="primary"
                                size="lg"
                                leftIcon="cart-outline"
                                fullWidth
                                disabled={!product.isAvailable}
                            />
                        </View>
                        <View style={styles.buttonHalfRight}>
                            <Button
                                title="Save & Buy"
                                onPress={handleCreatePackage}
                                variant="outline"
                                size="lg"
                                leftIcon="wallet-outline"
                                fullWidth
                                disabled={!product.isAvailable}
                            />
                        </View>
                    </View>

                    {/* Helper Text */}
                    <View style={styles.helperTextContainer}>
                        <View style={styles.helperTextRow}>
                            <View style={styles.helperDot} />
                            <Text style={styles.helperText}>
                                <Text style={styles.helperTextBold}>Buy Now:</Text> Purchase immediately with instant payment
                            </Text>
                        </View>
                        <View style={styles.helperTextRow}>
                            <View style={styles.helperDot} />
                            <Text style={styles.helperText}>
                                <Text style={styles.helperTextBold}>Save & Buy:</Text> Create a savings plan and pay over time
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Create Package Modal */}
            <CreatePackageModal
                visible={showCreateModal}
                product={product}
                onClose={() => setShowCreateModal(false)}
                onConfirm={handleConfirmCreate}
                isCreating={createPackageMutation.isPending}
            />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f9fafb',
    },
    errorText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        textAlign: 'center',
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#0066A1',
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imageGalleryContainer: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        backgroundColor: '#000000',
        position: 'relative',
    },
    productImage: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
    },
    imagePlaceholder: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    imagePlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af',
    },
    imageIndicatorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 3,
    },
    imageIndicatorActive: {
        backgroundColor: 'white',
        width: 24,
    },
    imageCounter: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    imageCounterText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    enlargeHint: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    enlargeHintText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '500',
    },
    thumbnailContainer: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    thumbnailScroll: {
        paddingHorizontal: 4,
    },
    thumbnailWrapper: {
        marginRight: 8,
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnailActive: {
        borderColor: '#0066A1',
        borderWidth: 3,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 102, 161, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailCheckmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0066A1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    detailsContent: {
        padding: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 32,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
        gap: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    priceContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    price: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0066A1',
    },
    discountBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 8,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400e',
    },
    statusContainer: {
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusAvailable: {
        backgroundColor: '#d1fae5',
    },
    statusUnavailable: {
        backgroundColor: '#fee2e2',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusDotAvailable: {
        backgroundColor: '#10b981',
    },
    statusDotUnavailable: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusTextAvailable: {
        color: '#065f46',
    },
    statusTextUnavailable: {
        color: '#991b1b',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
    },
    tagsContainer: {
        marginBottom: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#0369a1',
        fontWeight: '500',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#e6f2ff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 12,
    },
    infoCardText: {
        flex: 1,
        fontSize: 13,
        color: '#0066A1',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 100,
    },
    bottomAction: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    bottomPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bottomPriceLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    bottomPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0066A1',
    },
    bottomButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    buttonHalf: {
        flex: 1,
    },
    buttonHalfLeft: {
        flex: 1,
        marginRight: 6,
    },
    buttonHalfRight: {
        flex: 1,
        marginLeft: 6,
    },
    helperTextContainer: {
        paddingTop: 4,
    },
    helperTextRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    helperDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6b7280',
        marginTop: 6,
        marginRight: 8,
    },
    helperText: {
        flex: 1,
        fontSize: 11,
        color: '#6b7280',
        lineHeight: 16,
    },
    helperTextBold: {
        fontWeight: '600',
        color: '#374151',
    },
});
