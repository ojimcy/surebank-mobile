/**
 * Savings Packages Component
 * Display user's existing savings packages with horizontal scroll and auto-slide
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SavingsPackagesProps, SavingsPackage } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 300;
const CARD_MARGIN = 16;

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const getPackageIcon = (icon: string): keyof typeof Ionicons.glyphMap => {
    switch (icon) {
        case 'home':
            return 'home-outline';
        case 'book-open':
            return 'book-outline';
        case 'laptop':
            return 'laptop-outline';
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

interface PackageCardProps {
    package: SavingsPackage;
    onPress: (packageId: string) => void;
    onDeposit: (packageId: string) => void;
}

const PackageCard = ({ package: pkg, onPress, onDeposit }: PackageCardProps) => (
    <TouchableOpacity
        style={styles.packageCard}
        onPress={() => onPress(pkg.id)}
        activeOpacity={0.7}
    >
        <View style={styles.packageHeader}>
            <View style={styles.packageInfo}>
                <View
                    style={[
                        styles.packageTypeBadge,
                        { backgroundColor: `${pkg.color}20` },
                    ]}
                >
                    <Text style={[styles.packageTypeText, { color: pkg.color }]}>
                        {pkg.type.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
            </View>
            <View
                style={[
                    styles.packageIconContainer,
                    { backgroundColor: `${pkg.color}20` },
                ]}
            >
                <Ionicons
                    name={getPackageIcon(pkg.icon)}
                    size={20}
                    color={pkg.color}
                />
            </View>
        </View>

        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>{pkg.progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${pkg.progress}%`,
                            backgroundColor: pkg.color,
                        },
                    ]}
                />
            </View>
        </View>

        <View style={styles.packageAmounts}>
            <View style={styles.amountColumn}>
                <Text style={styles.amountLabel}>Current Balance</Text>
                <Text style={styles.amountValue}>{formatCurrency(pkg.current)}</Text>
            </View>
            <View style={styles.amountColumn}>
                <Text style={styles.amountLabel}>
                    {pkg.type === 'ds' ? 'Amount Per Day' : 'Target'}
                </Text>
                <Text style={styles.amountValue}>
                    {pkg.type === 'ds' && pkg.amountPerDay
                        ? formatCurrency(pkg.amountPerDay)
                        : formatCurrency(pkg.target)}
                </Text>
            </View>
        </View>

        <TouchableOpacity
            style={[styles.depositButton, { backgroundColor: pkg.color }]}
            onPress={() => onDeposit(pkg.id)}
        >
            <Text style={styles.depositButtonText}>Deposit</Text>
        </TouchableOpacity>
    </TouchableOpacity>
);

const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.skeletonScrollContent}
        >
            {[...Array(3)].map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                    <View style={styles.skeletonHeader}>
                        <View style={styles.skeletonBadge} />
                        <View style={styles.skeletonIcon} />
                    </View>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonProgress} />
                    <View style={styles.skeletonAmounts}>
                        <View style={styles.skeletonAmount} />
                        <View style={styles.skeletonAmount} />
                    </View>
                    <View style={styles.skeletonButton} />
                </View>
            ))}
        </ScrollView>
    </View>
);

export default function SavingsPackages({
    packages,
    isLoading,
    onViewAll,
    onCreateNew,
    onPackagePress,
    onDeposit,
}: SavingsPackagesProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Filter packages to show max 3 with preference for active and different types
    const filteredPackages = useMemo(() => {
        // If we have 3 or fewer packages, show all of them
        if (packages.length <= 3) return packages;

        // First, prioritize active packages
        const activePackages = packages.filter(pkg => pkg.status === 'active');

        // Get unique package types
        const uniqueTypes = [...new Set(packages.map(pkg => pkg.type))];

        // If we have 3 or fewer unique types, get one package of each type
        const selectedPackages: SavingsPackage[] = [];

        // Try to get one active package of each type first
        uniqueTypes.forEach(type => {
            if (selectedPackages.length < 3) {
                // First look for active packages of this type
                const activePackageOfType = activePackages.find(pkg =>
                    pkg.type === type && !selectedPackages.includes(pkg)
                );

                if (activePackageOfType) {
                    selectedPackages.push(activePackageOfType);
                } else {
                    // If no active package of this type, get any package of this type
                    const packageOfType = packages.find(pkg =>
                        pkg.type === type && !selectedPackages.includes(pkg)
                    );
                    if (packageOfType) selectedPackages.push(packageOfType);
                }
            }
        });

        // If we still have fewer than 3 packages, add more active packages first
        if (selectedPackages.length < 3) {
            activePackages.forEach(pkg => {
                if (selectedPackages.length < 3 && !selectedPackages.includes(pkg)) {
                    selectedPackages.push(pkg);
                }
            });

            // If still fewer than 3, add any remaining packages
            if (selectedPackages.length < 3) {
                packages.forEach(pkg => {
                    if (selectedPackages.length < 3 && !selectedPackages.includes(pkg)) {
                        selectedPackages.push(pkg);
                    }
                });
            }
        }

        return selectedPackages;
    }, [packages]);

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

        // Only set up the interval if we have packages
        if (filteredPackages.length > 1) {
            intervalRef.current = setInterval(() => {
                const nextSlide = (activeSlide + 1) % filteredPackages.length;
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
    }, [activeSlide, filteredPackages.length, handleSlideChange]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Savings</Text>
                </View>
                <LoadingSkeleton />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Savings</Text>
                <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward-outline" size={16} color="#0066A1" />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {filteredPackages.map((pkg) => (
                    <View key={pkg.id} style={styles.cardContainer}>
                        <PackageCard
                            package={pkg}
                            onPress={onPackagePress}
                            onDeposit={onDeposit}
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            {filteredPackages.length > 1 && (
                <View style={styles.paginationContainer}>
                    {filteredPackages.map((_, index) => (
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

            {/* Create New Package CTA */}
            <View style={styles.ctaContainer}>
                <TouchableOpacity onPress={onCreateNew} style={styles.createButton}>
                    <Ionicons name="add-outline" size={20} color="#0066A1" />
                    <Text style={styles.createButtonText}>Create New Package</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        color: '#0066A1',
        fontWeight: '500',
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
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    packageInfo: {
        flex: 1,
    },
    packageTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    packageTypeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    packageIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    packageAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountColumn: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    depositButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    depositButtonText: {
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
    ctaContainer: {
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
    },
    createButton: {
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0066A1',
    },
    // Loading skeleton styles
    skeletonContainer: {
        paddingVertical: 16,
    },
    skeletonScrollContent: {
        paddingHorizontal: 24,
    },
    skeletonCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginRight: CARD_MARGIN,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    skeletonBadge: {
        width: 40,
        height: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
    },
    skeletonIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
    },
    skeletonTitle: {
        width: '60%',
        height: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        marginBottom: 16,
    },
    skeletonProgress: {
        width: '100%',
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        marginBottom: 16,
    },
    skeletonAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    skeletonAmount: {
        width: '40%',
        height: 40,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
    },
    skeletonButton: {
        width: '100%',
        height: 40,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
});
