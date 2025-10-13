/**
 * Featured Products Carousel Component
 * Horizontal scrolling carousel for featured products
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
const CARD_WIDTH = width * 0.7;

interface FeaturedProductsProps {
    products: Product[];
    onProductPress: (productId: string) => void;
}

export default function FeaturedProducts({ products, onProductPress }: FeaturedProductsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Featured Products</Text>
                <Text style={styles.subtitle}>Handpicked for you</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
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
                                <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                            </View>
                        )}

                        {/* Featured Badge */}
                        <View style={styles.badge}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.badgeText}>Featured</Text>
                        </View>

                        {/* Product Info */}
                        <View style={styles.info}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {product.name}
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>
                                    ₦{(product.sellingPrice || product.price || 0).toLocaleString()}
                                </Text>
                                {product.sellingPrice && product.price && product.sellingPrice < product.price && (
                                    <Text style={styles.originalPrice}>
                                        ₦{product.price.toLocaleString()}
                                    </Text>
                                )}
                            </View>
                            {product.categoryName && (
                                <Text style={styles.category}>{product.categoryName}</Text>
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
        marginBottom: 52,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 16,
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
    scrollContent: {
        paddingLeft: 8,
        paddingRight: 8,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    firstCard: {
        marginLeft: 24,
    },
    lastCard: {
        marginRight: 24,
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#f3f4f6',
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066A1',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
    info: {
        padding: 16,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        minHeight: 40,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0066A1',
    },
    originalPrice: {
        fontSize: 14,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    category: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
});
