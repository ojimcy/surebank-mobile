/**
 * CategoryFilter Component
 * Horizontal scrollable category filter chips
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import type { Category } from '@/services/api/products';

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onSelectCategory
}: CategoryFilterProps) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <TouchableOpacity
                    style={[
                        styles.chip,
                        selectedCategory === '' && styles.chipSelected,
                    ]}
                    onPress={() => onSelectCategory('')}
                >
                    <Text
                        style={[
                            styles.chipText,
                            selectedCategory === '' && styles.chipTextSelected,
                        ]}
                        numberOfLines={1}
                    >
                        All Products
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.chip,
                        selectedCategory === 'shoes' && styles.chipSelected,
                    ]}
                    onPress={() => onSelectCategory('shoes')}
                >
                    <Text
                        style={[
                            styles.chipText,
                            selectedCategory === 'shoes' && styles.chipTextSelected,
                        ]}
                        numberOfLines={1}
                    >
                        Shoes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.chip,
                        selectedCategory === 'edibles' && styles.chipSelected,
                    ]}
                    onPress={() => onSelectCategory('edibles')}
                >
                    <Text
                        style={[
                            styles.chipText,
                            selectedCategory === 'edibles' && styles.chipTextSelected,
                        ]}
                        numberOfLines={1}
                    >
                        Edibles and food items
                    </Text>
                </TouchableOpacity>

                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id || category._id}
                        style={[
                            styles.chip,
                            selectedCategory === category.id && styles.chipSelected,
                        ]}
                        onPress={() => onSelectCategory(category.id)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedCategory === category.id && styles.chipTextSelected,
                            ]}
                            numberOfLines={1}
                        >
                            {category.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    container: {
        flexGrow: 0,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    chipSelected: {
        backgroundColor: '#0066A1',
    },
    chipText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        textAlign: 'center',
    },
    chipTextSelected: {
        color: '#ffffff',
    },
});