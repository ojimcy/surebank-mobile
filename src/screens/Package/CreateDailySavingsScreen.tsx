/**
 * Create Daily Savings Package Screen
 * Professional form for creating daily savings packages
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NestedHeader } from '@/components/navigation';
import type { PackageScreenProps } from '@/navigation/types';

export default function CreateDailySavingsScreen({ navigation }: PackageScreenProps<'CreateDailySavings'>) {
    return (
        <SafeAreaView style={styles.container}>
            <NestedHeader
                title="Create Daily Savings"
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Daily Savings Package</Text>
                <Text style={styles.subtitle}>
                    This screen will contain the form to create a daily savings package.
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
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});
