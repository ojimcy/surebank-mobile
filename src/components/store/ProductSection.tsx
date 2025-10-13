/**
 * Product Section Component
 * Reusable horizontal product list section with title and view all
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/services/api/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

interface ProductSectionProps {
    title: string;
    subtitle?: string;
    products: Product[];
    onProductPress: (productId: string) => void;
    onViewAll: () => void;
}

export default function ProductSection({
    title,
    subtitle,
    products,
    onProductPress,
    onViewAll,
}: ProductSectionProps) {
    if (products.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <TouchableOpacity
                    onPress={onViewAll}
                    style={styles.viewAllButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0066A1" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {products.map((product, index) => (
                    <TouchableOpacity
                        key={product._id}
                        style={[
                            styles.card,
                            index === 0 && styles.firstCard,
                            index === products.length - 1 && styles.lastCard,
                        ]}
                        onPress={() => onProductPress(product._id)}
                        activeOpacity={0.9}
                    >
                        {/* Product Image */}
                        {product.images && product.images.length > 0 ? (
                            <Image
                                source={{ uri: product.images[0] }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="cube-outline" size={32} color="#9ca3af" />
                            </View>
                        )}

                        {/* Discount Badge */}
                        {product.sellingPrice && product.price && product.sellingPrice < product.price && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                    {Math.round(((product.price - product.sellingPrice) / product.price) * 100)}% OFF
                                </Text>
                            </View>
                        )}

                        {/* Product Info */}
                        <View style={styles.info}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {product.name}
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>
                                    ₦{(product.sellingPrice || product.price || 0).toLocaleString()}
                                </Text>
                            </View>
                            {product.categoryName && (
                                <Text style={styles.category} numberOfLines={1}>
                                    {product.categoryName}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066A1',
    },
    scrollContent: {
        paddingLeft: 16,
        paddingRight: 16,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    firstCard: {
        marginLeft: 24,
    },
    lastCard: {
        marginRight: 24,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#f3f4f6',
    },
    imagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    info: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        minHeight: 36,
    },
    priceContainer: {
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0066A1',
    },
    category: {
        fontSize: 11,
        color: '#9ca3af',
    },
});
