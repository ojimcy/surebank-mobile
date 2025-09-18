/**
 * Nested Header Component for Secondary Screens
 * Matches the Capacitor app design with back button and centered title
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NestedHeaderProps {
    title: string;
    onBack?: () => void;
}

export default function NestedHeader({ title, onBack }: NestedHeaderProps) {
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        }
        // If no onBack provided, React Navigation will handle it automatically
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.content}>
                    {/* Back button - positioned on the left */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    {/* Title - centered */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    {/* Right spacer to balance the layout */}
                    <View style={styles.rightSpacer} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 60,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    rightSpacer: {
        width: 40, // Same width as back button to center the title
    },
});
