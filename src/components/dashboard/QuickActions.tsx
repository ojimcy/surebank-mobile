/**
 * Quick Actions Component
 * 5 primary action buttons for common user tasks
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { QuickActionsProps } from './types';

interface QuickAction {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

export default function QuickActions({
    onNewPackage,
    onDeposit,
    onWithdraw,
    onMyCards,
    onSchedules,
}: QuickActionsProps) {
    const actions: QuickAction[] = [
        {
            id: 'new-package',
            title: 'New Package',
            icon: 'add-circle-outline',
            onPress: onNewPackage,
        },
        {
            id: 'deposit',
            title: 'Deposit',
            icon: 'arrow-down-circle-outline',
            onPress: onDeposit,
        },
        {
            id: 'withdraw',
            title: 'Withdraw',
            icon: 'arrow-up-circle-outline',
            onPress: onWithdraw,
        },
        {
            id: 'my-cards',
            title: 'My Cards',
            icon: 'card-outline',
            onPress: onMyCards,
        },
        {
            id: 'schedules',
            title: 'Schedules',
            icon: 'calendar-outline',
            onPress: onSchedules,
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionButton}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={action.icon}
                                size={24}
                                color="#0066A1"
                                style={styles.icon}
                            />
                        </View>
                        <Text style={styles.actionText}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    icon: {
        // Icon styles handled by Ionicons
    },
    actionText: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 16,
    },
});
