/**
 * Promotion Banner Component
 * Eye-catching banner for promotions and special offers
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PromotionBannerProps {
    title: string;
    subtitle: string;
    onPress: () => void;
}

export default function PromotionBanner({ title, subtitle, onPress }: PromotionBannerProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#7c3aed', '#a855f7', '#c084fc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.banner}
                >
                    {/* Decorative Elements */}
                    <View style={styles.decorativeCircle1} />
                    <View style={styles.decorativeCircle2} />

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.textContainer}>
                            <View style={styles.badge}>
                                <Ionicons name="flash" size={12} color="#7c3aed" />
                                <Text style={styles.badgeText}>Limited Time</Text>
                            </View>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </View>

                        <View style={styles.actionButton}>
                            <Text style={styles.buttonText}>Shop Now</Text>
                            <Ionicons name="arrow-forward" size={16} color="#7c3aed" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    banner: {
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
        minHeight: 140,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -30,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -20,
        left: -30,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
    textContainer: {
        marginBottom: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#7c3aed',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7c3aed',
    },
});
