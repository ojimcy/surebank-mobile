/**
 * Main Header Component for Mobile App
 * Matches the Capacitor app design with profile, welcome message, and notifications
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MainHeaderProps {
    onNotificationPress?: () => void;
    onAvatarPress?: () => void;
}

export default function MainHeader({
    onNotificationPress,
    onAvatarPress,
}: MainHeaderProps) {
    const { user } = useAuth();
    const { hasUnreadNotifications, unreadCount } = useNotifications();
    const insets = useSafeAreaInsets();

    // Get user's initials for avatar
    const getUserInitials = () => {
        if (!user) return '';

        const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
        const lastInitial = user.lastName ? user.lastName.charAt(0) : '';

        return `${firstInitial}${lastInitial}`;
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.content}>
                    {/* Left side - Profile icon and welcome message */}
                    <View style={styles.leftSection}>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={onAvatarPress}
                            accessibilityLabel="Account Settings"
                            accessibilityRole="button"
                        >
                            {user ? (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {getUserInitials()}
                                    </Text>
                                </View>
                            ) : (
                                <Ionicons name="person" size={20} color="#6b7280" />
                            )}
                        </TouchableOpacity>

                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome to</Text>
                            <Text style={styles.appName}>SureBank</Text>
                        </View>
                    </View>

                    {/* Right side - Notification icon */}
                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={onNotificationPress}
                            accessibilityLabel="Notifications"
                            accessibilityRole="button"
                        >
                            <View style={styles.notificationContainer}>
                                <Ionicons name="notifications-outline" size={24} color="#6b7280" />
                                {hasUnreadNotifications && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.badgeText}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff', // White background like Capacitor app
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb', // Light gray border
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 60,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0066A1', // Blue like Capacitor app
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
    },
    welcomeSection: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '400',
    },
    appName: {
        fontSize: 20,
        color: '#111827',
        fontWeight: '700',
    },
    notificationButton: {
        padding: 8,
        borderRadius: 20,
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
