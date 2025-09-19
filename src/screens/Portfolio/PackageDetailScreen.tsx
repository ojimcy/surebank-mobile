/**
 * Package Detail Screen
 * Professional package management and details screen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NestedHeader } from '@/components/navigation';
import type { PortfolioScreenProps } from '@/navigation/types';

export default function PackageDetailScreen({ navigation, route }: PortfolioScreenProps<'PackageDetail'>) {
    const { packageId, packageType } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <NestedHeader
                title="Package Details"
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Package Details</Text>
                <Text style={styles.subtitle}>
                    Package ID: {packageId}
                </Text>
                <Text style={styles.subtitle}>
                    Type: {packageType}
                </Text>
                <Text style={styles.description}>
                    This screen will show detailed package information, progress,
                    transaction history, and management options.
                    Coming in the next implementation phase.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#0066A1',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 16,
    },
});
