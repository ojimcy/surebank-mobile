/**
 * ProductCard Component
 * Displays individual product information in a card format
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/services/api/products';

interface ProductCardProps {
    product: Product;
    isSelected?: boolean;
    onPress: (product: Product) => void;
}

export function ProductCard({ product, isSelected = false, onPress }: ProductCardProps) {
    const price = product.sellingPrice || product.price || 0;

    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.containerSelected]}
            onPress={() => onPress(product)}
            activeOpacity={0.7}
        >
            {product.images && product.images.length > 0 ? (
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={36} color="#d1d5db" />
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                {product.description && (
                    <Text style={styles.description} numberOfLines={1}>
                        {product.description}
                    </Text>
                )}
                <Text style={styles.price}>₦{price.toLocaleString()}</Text>
            </View>

            {isSelected && (
                <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#0066A1" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 0.48,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        margin: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    containerSelected: {
        borderColor: '#0066A1',
        borderWidth: 2,
    },
    image: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
        backgroundColor: '#f9fafb',
    },
    imagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    info: {
        padding: 12,
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        minHeight: 36,
    },
    description: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 8,
        lineHeight: 14,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0066A1',
        marginTop: 'auto',
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});