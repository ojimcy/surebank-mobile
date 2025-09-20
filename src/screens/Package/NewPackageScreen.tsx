/**
 * New Package Screen
 * Package type selection screen with professional banking app design
 */

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PACKAGE_TYPES } from '@/constants/packages';
import type { PackageScreenProps } from '@/navigation/types';

export default function NewPackageScreen({ navigation }: PackageScreenProps<'NewPackage'>) {
    const handlePackageTypeSelect = (packageType: typeof PACKAGE_TYPES[0]) => {
        switch (packageType.id) {
            case 'ds':
                navigation.navigate('CreateDailySavings');
                break;
            case 'ibs':
                navigation.navigate('CreateIBSPackage');
                break;
            case 'sb':
                navigation.navigate('CreateSBPackage');
                break;
            default:
                console.log('Unknown package type:', packageType.id);
        }
    };

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Choose Package Type</Text>
                    <Text style={styles.headerSubtitle}>
                        Select the savings package that best fits your financial goals
                    </Text>
                </View>

                {/* Package Types */}
                <View style={styles.packageTypesSection}>
                    {PACKAGE_TYPES.map((packageType, index) => (
                        <TouchableOpacity
                            key={packageType.id}
                            style={[
                                styles.packageTypeCard,
                                { marginTop: index > 0 ? 16 : 0 }
                            ]}
                            onPress={() => handlePackageTypeSelect(packageType)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[packageType.color, `${packageType.color}dd`]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.packageTypeGradient}
                            >
                                <View style={styles.packageTypeHeader}>
                                    <View style={styles.packageTypeIconContainer}>
                                        <Ionicons
                                            name={packageType.icon as any}
                                            size={32}
                                            color="#ffffff"
                                        />
                                    </View>
                                    <View style={styles.packageTypeTitleSection}>
                                        <Text style={styles.packageTypeTitle}>{packageType.title}</Text>
                                        <Text style={styles.packageTypeDescription}>
                                            {packageType.description}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.8)" />
                                </View>

                                <View style={styles.packageTypeFeatures}>
                                    {packageType.features.slice(0, 3).map((feature, featureIndex) => (
                                        <View key={featureIndex} style={styles.featureItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="rgba(255, 255, 255, 0.9)" />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.packageTypeCTA}>
                                    <Text style={styles.ctaText}>{packageType.cta}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="information-circle" size={24} color="#0066A1" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Need Help Choosing?</Text>
                            <Text style={styles.infoDescription}>
                                Each package type is designed for different financial goals.
                                Daily Savings for flexible goals, Interest-Based for guaranteed returns,
                                and SB Packages for specific products.
                            </Text>
                        </View>
                    </View>
                </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        paddingBottom: 32,
    },
    headerSection: {
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
    },
    packageTypesSection: {
        paddingHorizontal: 24,
    },
    packageTypeCard: {
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    packageTypeGradient: {
        padding: 24,
    },
    packageTypeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    packageTypeIconContainer: {
        width: 56,
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    packageTypeTitleSection: {
        flex: 1,
        marginRight: 12,
    },
    packageTypeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    packageTypeDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    packageTypeFeatures: {
        marginBottom: 20,
        gap: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        flex: 1,
    },
    packageTypeCTA: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    infoSection: {
        padding: 24,
        paddingTop: 32,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    infoDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
});
