/**
 * Store Home Screen
 * E-commerce storefront with featured products, categories, and promotions
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainHeader } from '@/components/navigation';
import {
    FeaturedProducts,
    CategoryGrid,
    PromotionBanner,
    ProductSection,
} from '@/components/store';
import { useQuery } from '@tanstack/react-query';
import productsService from '@/services/api/products';

export default function StoreHomeScreen() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    // Fetch featured products
    const { data: featuredData, refetch: refetchFeatured } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: () => productsService.getSBProducts(1, 6),
    });

    // Fetch popular/bestseller products
    const { data: popularData, refetch: refetchPopular } = useQuery({
        queryKey: ['popularProducts'],
        queryFn: () => productsService.getSBProducts(1, 8),
    });

    // Fetch new arrivals
    const { data: newArrivalsData, refetch: refetchNewArrivals } = useQuery({
        queryKey: ['newArrivals'],
        queryFn: () => productsService.getSBProducts(1, 8),
    });

    const featuredProducts = featuredData?.results || [];
    const popularProducts = popularData?.results || [];
    const newArrivals = newArrivalsData?.results || [];

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchFeatured(),
                refetchPopular(),
                refetchNewArrivals(),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [refetchFeatured, refetchPopular, refetchNewArrivals]);

    const handleNotificationPress = () => {
        console.log('Navigate to notifications');
    };

    const handleAvatarPress = () => {
        // Navigate to Account tab (Dashboard)
        navigation.getParent()?.navigate('SettingsTab', {
            screen: 'Settings',
        });
    };

    const handleProductPress = (productId: string) => {
        // Navigate to Products tab with product detail
        navigation.getParent()?.navigate('ProductsTab', {
            screen: 'CreateSBPackage',
            params: { productId },
        });
    };

    const handleCategoryPress = (categoryId: string) => {
        // Navigate to Products tab filtered by category
        navigation.getParent()?.navigate('ProductsTab', {
            screen: 'ProductsHome',
        });
    };

    const handleViewAllProducts = () => {
        navigation.getParent()?.navigate('ProductsTab', {
            screen: 'ProductsHome',
        });
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'packages':
                navigation.getParent()?.navigate('PackageTab', {
                    screen: 'PackageHome',
                });
                break;
            case 'savings':
                navigation.getParent()?.navigate('PackageTab', {
                    screen: 'NewPackage',
                });
                break;
            case 'account':
                navigation.getParent()?.navigate('SettingsTab', {
                    screen: 'Dashboard',
                });
                break;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MainHeader
                onNotificationPress={handleNotificationPress}
                onAvatarPress={handleAvatarPress}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Discover Amazing Products</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Save towards your goals with flexible payment plans
                    </Text>
                </View>

                {/* Promotion Banner */}
                <PromotionBanner
                    title="Special Offer"
                    subtitle="Save up to 30% on selected items"
                    onPress={() => handleViewAllProducts()}
                />

                {/* Featured Products Carousel */}
                {featuredProducts.length > 0 && (
                    <FeaturedProducts
                        products={featuredProducts}
                        onProductPress={handleProductPress}
                    />
                )}

                {/* Categories Grid */}
                <CategoryGrid onCategoryPress={handleCategoryPress} />

                {/* Popular Products */}
                {popularProducts.length > 0 && (
                    <ProductSection
                        title="Popular Products"
                        subtitle="Most loved by our customers"
                        products={popularProducts}
                        onProductPress={handleProductPress}
                        onViewAll={handleViewAllProducts}
                    />
                )}

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                    <ProductSection
                        title="New Arrivals"
                        subtitle="Check out our latest products"
                        products={newArrivals}
                        onProductPress={handleProductPress}
                        onViewAll={handleViewAllProducts}
                    />
                )}

                {/* Quick Savings Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleQuickAction('packages')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#e6f2ff' }]}>
                                <Ionicons name="wallet-outline" size={24} color="#0066A1" />
                            </View>
                            <Text style={styles.quickActionText}>My Packages</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleQuickAction('savings')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#ecfdf5' }]}>
                                <Ionicons name="add-circle-outline" size={24} color="#10b981" />
                            </View>
                            <Text style={styles.quickActionText}>Start Saving</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => handleQuickAction('account')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                                <Ionicons name="person-outline" size={24} color="#f59e0b" />
                            </View>
                            <Text style={styles.quickActionText}>Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    },
    scrollContent: {
        paddingBottom: 32,
    },
    // Welcome Section
    welcomeSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
    },
    // Quick Actions
    quickActionsSection: {
        paddingHorizontal: 24,
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
});
