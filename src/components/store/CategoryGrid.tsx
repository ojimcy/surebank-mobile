/**
 * Category Grid Component
 * Modern image-based grid display of product categories
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Category } from '@/services/api/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // Account for padding and gap

interface CategoryGridProps {
    categories?: Category[]; // Made optional since we're using hardcoded data
    onCategoryPress: (categoryId: string) => void;
}

// Featured categories - hardcoded as shown on website
const FEATURED_CATEGORIES = [
    {
        id: 'smartphones',
        title: 'Smartphones',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
        description: 'Latest smartphones and mobile devices',
    },
    {
        id: 'electronics',
        title: 'Electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
        description: 'Laptops, tablets, and gadgets',
    },
    {
        id: 'furniture',
        title: 'Furniture',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
        description: 'Modern home and office furniture',
    },
    {
        id: 'fashion',
        title: 'Fashion',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
        description: 'Clothing and accessories',
    },
    {
        id: 'cars',
        title: 'Cars',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
        description: 'Luxury and economy vehicles',
    },
    {
        id: 'spare-parts',
        title: 'Spare Parts',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
        description: 'Auto parts and accessories',
    },
];

export default function CategoryGrid({ onCategoryPress }: CategoryGridProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop by Category</Text>
                <Text style={styles.subtitle}>Explore our collections</Text>
            </View>

            <View style={styles.grid}>
                {FEATURED_CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryCard}
                        onPress={() => onCategoryPress(category.id)}
                        activeOpacity={0.9}
                    >
                        <ImageBackground
                            source={{ uri: category.image }}
                            style={styles.imageBackground}
                            imageStyle={styles.image}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                                style={styles.gradient}
                            >
                                <Text style={styles.categoryName}>
                                    {category.title}
                                </Text>
                            </LinearGradient>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 20,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    categoryCard: {
        width: CARD_WIDTH,
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    image: {
        borderRadius: 16,
        resizeMode: 'cover',
    },
    gradient: {
        padding: 16,
        paddingTop: 40,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    productCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
});
