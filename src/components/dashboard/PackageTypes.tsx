/**
 * Package Types Component
 * Display available package types for new users with detailed information
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PackageTypesProps, PackageType } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 300;
const CARD_MARGIN = 16;

const getPackageIcon = (icon: string): keyof typeof Ionicons.glyphMap => {
    switch (icon) {
        case 'calendar':
            return 'calendar-outline';
        case 'trending-up':
            return 'trending-up-outline';
        case 'target':
            return 'flag-outline';
        default:
            return 'wallet-outline';
    }
};

const getPackageActionIcon = (id: string): keyof typeof Ionicons.glyphMap => {
    switch (id) {
        case 'ds':
            return 'add-outline';
        case 'ibs':
            return 'lock-closed-outline';
        case 'sb':
            return 'storefront-outline';
        default:
            return 'arrow-forward-outline';
    }
};

interface PackageTypeCardProps {
    packageType: PackageType;
    onPress: (type: PackageType) => void;
}

const PackageTypeCard = ({ packageType, onPress }: PackageTypeCardProps) => (
    <View style={styles.packageCard}>
        <View style={styles.packageHeader}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: `${packageType.color}20` },
                ]}
            >
                <Ionicons
                    name={getPackageIcon(packageType.icon)}
                    size={24}
                    color={packageType.color}
                />
            </View>
            <Text style={[styles.packageTitle, { color: packageType.color }]}>
                {packageType.title}
            </Text>
            <Text style={styles.packageDescription}>
                {packageType.description}
            </Text>
        </View>

        <View style={styles.featuresSection}>
            {packageType.id === 'ds' && (
                <View style={styles.featuresContainer}>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Minimum</Text>
                        <Text style={styles.featureValue}>₦1,000</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Frequency</Text>
                        <Text style={styles.featureValue}>Daily/Weekly/Monthly</Text>
                    </View>
                </View>
            )}

            {packageType.id === 'ibs' && (
                <View style={styles.featuresContainer}>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Interest Rate</Text>
                        <Text style={[styles.featureValue, { color: '#10b981' }]}>
                            8-12% p.a.
                        </Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Lock Period</Text>
                        <Text style={styles.featureValue}>3-12 months</Text>
                    </View>
                </View>
            )}

            {packageType.id === 'sb' && (
                <View style={styles.featuresContainer}>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Products</Text>
                        <Text style={styles.featureValue}>Electronics, Appliances</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureLabel}>Payment Plan</Text>
                        <Text style={styles.featureValue}>Flexible</Text>
                    </View>
                </View>
            )}
        </View>

        <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: packageType.color }]}
            onPress={() => onPress(packageType)}
        >
            <Ionicons
                name={getPackageActionIcon(packageType.id)}
                size={18}
                color="#ffffff"
            />
            <Text style={styles.ctaButtonText}>{packageType.cta}</Text>
        </TouchableOpacity>
    </View>
);

export default function PackageTypes({
    packageTypes,
    onPackageTypePress,
    onViewAll,
}: PackageTypesProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Handle slide change
    const handleSlideChange = useCallback(
        (index: number) => {
            setActiveSlide(index);
            if (scrollViewRef.current) {
                const scrollX = index * (CARD_WIDTH + CARD_MARGIN);
                scrollViewRef.current.scrollTo({
                    x: scrollX,
                    animated: true,
                });
            }
        },
        []
    );

    // Setup and cleanup auto slide timer
    useEffect(() => {
        // Clear any existing interval when dependencies change
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Only set up the interval if we have multiple package types
        if (packageTypes.length > 1) {
            intervalRef.current = setInterval(() => {
                const nextSlide = (activeSlide + 1) % packageTypes.length;
                handleSlideChange(nextSlide);
            }, 5000);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [activeSlide, packageTypes.length, handleSlideChange]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Start Saving</Text>
                <Text style={styles.subtitle}>
                    Choose a savings plan that best suits your goals
                </Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {packageTypes.map((type) => (
                    <View key={type.id} style={styles.cardContainer}>
                        <PackageTypeCard
                            packageType={type}
                            onPress={onPackageTypePress}
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            {packageTypes.length > 1 && (
                <View style={styles.paginationContainer}>
                    {packageTypes.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.paginationDot,
                                activeSlide === index && styles.paginationDotActive,
                            ]}
                            onPress={() => handleSlideChange(index)}
                        />
                    ))}
                </View>
            )}

            {/* View All Button */}
            <View style={styles.viewAllContainer}>
                <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
                    <Ionicons name="eye-outline" size={20} color="#0066A1" />
                    <Text style={styles.viewAllButtonText}>View All Savings Plans</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        marginBottom: 24,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    scrollView: {
        // ScrollView styles
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    cardContainer: {
        marginRight: CARD_MARGIN,
    },
    packageCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    packageHeader: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    packageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    packageDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    featuresSection: {
        marginBottom: 20,
    },
    featuresContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    featureLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    featureValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    ctaButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
    },
    paginationDotActive: {
        backgroundColor: '#0066A1',
        width: 24,
    },
    viewAllContainer: {
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
    },
    viewAllButton: {
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewAllButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0066A1',
    },
});
