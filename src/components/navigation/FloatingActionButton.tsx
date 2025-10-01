/**
 * Floating Action Button with expandable menu
 * Matches the Capacitor app FAB design with quick actions
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FABMenuItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    backgroundColor: string;
    onPress: () => void;
}

interface FloatingActionButtonProps {
    onDeposit?: () => void;
    onNewPackage?: () => void;
    onWithdraw?: () => void;
    onMyCards?: () => void;
    onSchedules?: () => void;
}

export default function FloatingActionButton({
    onDeposit,
    onNewPackage,
    onWithdraw,
    onMyCards,
    onSchedules,
}: FloatingActionButtonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const menuItems: FABMenuItem[] = [
        {
            id: 'deposit',
            title: 'Deposit',
            icon: 'arrow-down',
            color: '#2563eb',
            backgroundColor: '#dbeafe',
            onPress: () => {
                onDeposit?.();
                setIsExpanded(false);
            },
        },
        {
            id: 'newPackage',
            title: 'New Package',
            icon: 'calendar',
            color: '#16a34a',
            backgroundColor: '#dcfce7',
            onPress: () => {
                onNewPackage?.();
                setIsExpanded(false);
            },
        },
        {
            id: 'withdraw',
            title: 'Withdraw',
            icon: 'arrow-up',
            color: '#9333ea',
            backgroundColor: '#f3e8ff',
            onPress: () => {
                onWithdraw?.();
                setIsExpanded(false);
            },
        },
        {
            id: 'myCards',
            title: 'My Cards',
            icon: 'card',
            color: '#eab308',
            backgroundColor: '#fef3c7',
            onPress: () => {
                onMyCards?.();
                setIsExpanded(false);
            },
        },
        {
            id: 'schedules',
            title: 'Schedules',
            icon: 'calendar-outline',
            color: '#6366f1',
            backgroundColor: '#e0e7ff',
            onPress: () => {
                onSchedules?.();
                setIsExpanded(false);
            },
        },
    ];

    const toggleMenu = () => {
        const toValue = isExpanded ? 0 : 1;

        Animated.spring(animatedValue, {
            toValue,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
        }).start();

        setIsExpanded(!isExpanded);
    };

    const menuOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const menuTranslateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    const fabRotation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <View style={[styles.container, { bottom: 70 + insets.bottom }]}>
            {/* Menu Items */}
            {isExpanded && (
                <Animated.View
                    style={[
                        styles.menu,
                        {
                            opacity: menuOpacity,
                            transform: [{ translateY: menuTranslateY }],
                        },
                    ]}
                >
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.menuIconContainer,
                                    { backgroundColor: item.backgroundColor },
                                ]}
                            >
                                <Ionicons name={item.icon} size={16} color={item.color} />
                            </View>
                            <Text style={styles.menuItemText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                    {/* Separator */}
                    <View style={styles.separator} />
                </Animated.View>
            )}

            {/* Backdrop */}
            {isExpanded && (
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={toggleMenu}
                    activeOpacity={1}
                />
            )}

            {/* FAB Button */}
            <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={toggleMenu}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: -1000,
        left: -1000,
        right: -1000,
        bottom: -1000,
        backgroundColor: 'transparent',
    },
    menu: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 8,
        marginBottom: 16,
        minWidth: 200,
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
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 16,
        marginVertical: 4,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0066A1',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
