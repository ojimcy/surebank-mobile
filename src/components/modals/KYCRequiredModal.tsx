/**
 * KYC Required Modal Component
 *
 * Modal that informs users they need to complete KYC verification
 * before they can create accounts or access certain features.
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

interface KYCRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string; // What feature requires KYC (e.g., "create an account", "withdraw funds")
  onStartVerification?: () => void;
}

export function KYCRequiredModal({
  visible,
  onClose,
  feature = 'use this feature',
  onStartVerification,
}: KYCRequiredModalProps) {
  const navigation = useNavigation<NavigationProp<any>>();

  const handleStartVerification = () => {
    onClose();
    if (onStartVerification) {
      onStartVerification();
    } else {
      // Navigate to KYC verification screen
      // @ts-ignore - Navigation typing needs improvement
      navigation.navigate('SettingsTab', {
        screen: 'KYCVerification',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="shield-checkmark-outline" size={40} color="#0066A1" />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Verification Required</Text>

            <Text style={styles.description}>
              To {feature}, you need to complete your KYC (Know Your Customer) verification.
            </Text>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Why KYC is required:</Text>

              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Secure your account and transactions</Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Comply with regulatory requirements</Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Access all SureBank features</Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Increase transaction limits</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
              <Text style={styles.infoText}>
                Verification takes only a few minutes. You'll need a valid government ID and a selfie.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartVerification}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Start Verification</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E6F2F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: '#0066A1',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0066A1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});