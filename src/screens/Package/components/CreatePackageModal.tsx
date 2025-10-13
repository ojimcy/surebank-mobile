/**
 * Create Package Modal
 * Reusable modal for creating SB packages from any screen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/services/api/products';
import { Button } from '@/components/forms/Button';

interface CreatePackageModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onConfirm: () => void;
    isCreating?: boolean;
}

export function CreatePackageModal({
    visible,
    product,
    onClose,
    onConfirm,
    isCreating = false,
}: CreatePackageModalProps) {
    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <View style={styles.modalHeader}>
                        {product.images && product.images.length > 0 ? (
                            <Image
                                source={{ uri: product.images[0] }}
                                style={styles.modalProductImage}
                            />
                        ) : (
                            <View style={styles.modalProductImagePlaceholder}>
                                <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                            </View>
                        )}
                    </View>

                    <View style={styles.modalBody}>
                        <Text style={styles.modalTitle}>Create SB Package</Text>
                        <Text style={styles.modalProductName}>{product.name}</Text>

                        {product.description && (
                            <Text style={styles.modalProductDescription}>
                                {product.description}
                            </Text>
                        )}

                        <View style={styles.modalPriceContainer}>
                            <Text style={styles.modalPriceLabel}>Target Amount</Text>
                            <Text style={styles.modalPriceValue}>
                                ₦{(product.sellingPrice || product.price || 0).toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.modalInfoCard}>
                            <Ionicons name="information-circle-outline" size={18} color="#0066A1" />
                            <Text style={styles.modalInfoText}>
                                You can save any amount towards this product. Once you reach the target amount, you can claim your product.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.modalActions}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Button
                                title="Cancel"
                                onPress={onClose}
                                variant="outline"
                                size="md"
                                fullWidth
                                disabled={isCreating}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Button
                                title="Create Package"
                                onPress={onConfirm}
                                variant="primary"
                                size="md"
                                leftIcon="checkmark"
                                loading={isCreating}
                                disabled={isCreating}
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 4,
    },
    modalHeader: {
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingVertical: 20,
    },
    modalProductImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    modalProductImagePlaceholder: {
        width: 120,
        height: 120,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalProductName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalProductDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalPriceContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    modalPriceLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    modalPriceValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0066A1',
    },
    modalInfoCard: {
        flexDirection: 'row',
        backgroundColor: '#e6f2ff',
        borderRadius: 8,
        padding: 12,
        alignItems: 'flex-start',
    },
    modalInfoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#0066A1',
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
});
