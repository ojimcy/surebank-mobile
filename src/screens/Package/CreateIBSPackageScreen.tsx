/**
 * Create Interest-Based Savings Package Screen
 * Professional form for creating IBS packages
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import type { PackageScreenProps } from '@/navigation/types';

export default function CreateIBSPackageScreen({ navigation }: PackageScreenProps<'CreateIBSPackage'>) {
    return (
        <View style={styles.container}>
                <Text style={styles.title}>Interest-Based Savings</Text>
                <Text style={styles.subtitle}>
                    This screen will contain the form to create an interest-based savings package.
                    Coming in the next implementation phase.
                </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
