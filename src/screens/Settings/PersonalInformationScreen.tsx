/**
 * Personal Information Screen
 * Professional screen for viewing and editing user personal information
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/forms';
import { NestedHeader } from '@/components/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { SettingsScreenProps } from '@/navigation/types';

interface PersonalInfoFormData {
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber: string;
}

export default function PersonalInformationScreen({
    navigation
}: SettingsScreenProps<'PersonalInformation'>) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PersonalInfoFormData>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        address: user?.address || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Reset form data to original values
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            address: user?.address || '',
            phoneNumber: user?.phoneNumber || '',
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to update user information
            console.log('Saving user information:', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsEditing(false);
            Alert.alert('Success', 'Your information has been updated successfully.');
        } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update your information. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneChange = () => {
        Alert.alert(
            'Phone Number Change',
            'Phone number change requires verification. This feature is coming soon.',
            [{ text: 'OK' }]
        );
    };

    const updateFormData = (field: keyof PersonalInfoFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.cardContent}>{children}</View>
        </View>
    );

    const InfoItem = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <NestedHeader
                title="Personal Information"
                onBackPress={handleBack}
                rightComponent={
                    !isEditing ? (
                        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                            <Ionicons name="create-outline" size={20} color="#0066A1" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!isEditing ? (
                    // View Mode
                    <View style={styles.viewMode}>
                        <InfoCard title="Personal Details">
                            <InfoItem label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                            <InfoItem label="Email Address" value={user?.email || ''} />
                            <InfoItem label="Phone Number" value={user?.phoneNumber || ''} />
                        </InfoCard>

                        <InfoCard title="Address Information">
                            <InfoItem label="Street Address" value={user?.address || ''} />
                        </InfoCard>

                        <InfoCard title="Account Status">
                            <View style={styles.statusContainer}>
                                <View style={styles.statusItem}>
                                    <View style={styles.statusIcon}>
                                        <Ionicons
                                            name={user?.isEmailVerified ? 'checkmark-circle' : 'time'}
                                            size={20}
                                            color={user?.isEmailVerified ? '#10b981' : '#f59e0b'}
                                        />
                                    </View>
                                    <View style={styles.statusInfo}>
                                        <Text style={styles.statusTitle}>Email Verification</Text>
                                        <Text style={[
                                            styles.statusValue,
                                            { color: user?.isEmailVerified ? '#10b981' : '#f59e0b' }
                                        ]}>
                                            {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statusItem}>
                                    <View style={styles.statusIcon}>
                                        <Ionicons
                                            name={user?.kycStatus === 'verified' ? 'shield-checkmark' : 'shield-outline'}
                                            size={20}
                                            color={user?.kycStatus === 'verified' ? '#10b981' : '#f59e0b'}
                                        />
                                    </View>
                                    <View style={styles.statusInfo}>
                                        <Text style={styles.statusTitle}>KYC Status</Text>
                                        <Text style={[
                                            styles.statusValue,
                                            { color: user?.kycStatus === 'verified' ? '#10b981' : '#f59e0b' }
                                        ]}>
                                            {user?.kycStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </InfoCard>
                    </View>
                ) : (
                    // Edit Mode
                    <View style={styles.editMode}>
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Edit Your Information</Text>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Personal Details</Text>

                                <Input
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChangeText={(text) => updateFormData('firstName', text)}
                                    leftIcon="person-outline"
                                />

                                <Input
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChangeText={(text) => updateFormData('lastName', text)}
                                    leftIcon="person-outline"
                                />

                                <View style={styles.disabledField}>
                                    <Input
                                        label="Email Address"
                                        placeholder="Email address"
                                        value={user?.email || ''}
                                        editable={false}
                                        leftIcon="mail-outline"
                                    />
                                    <Text style={styles.fieldNote}>Contact support to change email address</Text>
                                </View>

                                <View style={styles.phoneField}>
                                    <Input
                                        label="Phone Number"
                                        placeholder="Phone number"
                                        value={user?.phoneNumber || ''}
                                        editable={false}
                                        leftIcon="call-outline"
                                    />
                                    <TouchableOpacity onPress={handlePhoneChange} style={styles.changePhoneButton}>
                                        <Text style={styles.changePhoneText}>Change</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.fieldNote}>Phone number change requires verification</Text>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Address Information</Text>

                                <Input
                                    label="Street Address"
                                    placeholder="Enter your street address"
                                    value={formData.address}
                                    onChangeText={(text) => updateFormData('address', text)}
                                    leftIcon="location-outline"
                                    multiline
                                />
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={styles.cancelButton}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.saveButton, isLoading && styles.disabledButton]}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        paddingBottom: 32,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066A1',
    },
    // View Mode Styles
    viewMode: {
        padding: 24,
        gap: 20,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 16,
    },
    cardContent: {
        gap: 16,
    },
    infoItem: {
        gap: 4,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    statusContainer: {
        gap: 16,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Edit Mode Styles
    editMode: {
        padding: 24,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 24,
    },
    formSection: {
        marginBottom: 24,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    disabledField: {
        position: 'relative',
    },
    phoneField: {
        position: 'relative',
    },
    changePhoneButton: {
        position: 'absolute',
        right: 12,
        top: 38,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 102, 161, 0.1)',
    },
    changePhoneText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0066A1',
    },
    fieldNote: {
        fontSize: 11,
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: -12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#0066A1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
