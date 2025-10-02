/**
 * Security PIN Screen
 * Manage PIN security settings, biometric authentication, and auto-lock
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { PinInput } from '@/components/security';
import type { SettingsScreenProps } from '@/navigation/types';

type ModalMode = 'change-pin' | 'setup-pin' | 'disable-pin' | null;
type PinStep = 'verify' | 'create' | 'confirm';

const TIMEOUT_OPTIONS = [
  { label: 'Immediately', value: 0 },
  { label: '1 minute', value: 60 * 1000 },
  { label: '5 minutes', value: 5 * 60 * 1000 },
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
];

export default function SecurityPinScreen({ navigation }: SettingsScreenProps<'SecurityPin'>) {
  const pinSecurity = usePinSecurity();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentStep, setCurrentStep] = useState<PinStep>('verify');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTimeoutOptions, setShowTimeoutOptions] = useState(false);

  const resetPinFlow = () => {
    setCurrentStep('verify');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setIsProcessing(false);
  };

  const handleSetupPin = () => {
    resetPinFlow();
    setModalMode('setup-pin');
    setCurrentStep('create');
  };

  const handleChangePin = () => {
    resetPinFlow();
    setModalMode('change-pin');
    setCurrentStep('verify');
  };

  const handleDisablePin = () => {
    resetPinFlow();
    setModalMode('disable-pin');
    setCurrentStep('verify');
  };

  const handlePinComplete = async (pin: string) => {
    setPinError('');

    if (modalMode === 'setup-pin') {
      // Setup flow: create -> confirm
      if (currentStep === 'create') {
        setNewPin(pin);
        setCurrentStep('confirm');
      } else if (currentStep === 'confirm') {
        if (pin === newPin) {
          setIsProcessing(true);
          const success = await pinSecurity.setupPin(pin, false);
          setIsProcessing(false);

          if (success) {
            Alert.alert('Success', 'PIN has been set up successfully');
            setModalMode(null);
            resetPinFlow();
          } else {
            setPinError(pinSecurity.error || 'Failed to setup PIN');
          }
        } else {
          setPinError('PINs do not match. Please try again.');
          setConfirmPin('');
        }
      }
    } else if (modalMode === 'change-pin') {
      // Change flow: verify -> create -> confirm
      if (currentStep === 'verify') {
        setIsProcessing(true);
        const isValid = await pinSecurity.verifyPin(pin);
        setIsProcessing(false);

        if (isValid) {
          setCurrentPin(pin);
          setCurrentStep('create');
        } else {
          setPinError(pinSecurity.error || 'Incorrect PIN');
        }
      } else if (currentStep === 'create') {
        if (pin === currentPin) {
          setPinError('New PIN must be different from current PIN');
          return;
        }
        setNewPin(pin);
        setCurrentStep('confirm');
      } else if (currentStep === 'confirm') {
        if (pin === newPin) {
          setIsProcessing(true);
          const success = await pinSecurity.setupPin(pin, pinSecurity.isBiometricEnabled);
          setIsProcessing(false);

          if (success) {
            Alert.alert('Success', 'PIN has been changed successfully');
            setModalMode(null);
            resetPinFlow();
          } else {
            setPinError(pinSecurity.error || 'Failed to change PIN');
          }
        } else {
          setPinError('PINs do not match. Please try again.');
          setConfirmPin('');
        }
      }
    } else if (modalMode === 'disable-pin') {
      // Disable flow: verify only
      setIsProcessing(true);
      const isValid = await pinSecurity.verifyPin(pin);
      setIsProcessing(false);

      if (isValid) {
        Alert.alert(
          'Disable PIN',
          'Are you sure you want to disable PIN security? Your account will be less secure.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                setIsProcessing(true);
                const success = await pinSecurity.removePin();
                setIsProcessing(false);

                if (success) {
                  Alert.alert('Success', 'PIN security has been disabled');
                  setModalMode(null);
                  resetPinFlow();
                } else {
                  setPinError(pinSecurity.error || 'Failed to disable PIN');
                }
              },
            },
          ]
        );
      } else {
        setPinError(pinSecurity.error || 'Incorrect PIN');
      }
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!pinSecurity.isPinSet) {
      Alert.alert('PIN Required', 'Please set up a PIN before enabling biometric authentication');
      return;
    }

    if (enabled) {
      const success = await pinSecurity.enableBiometric();
      if (!success) {
        Alert.alert('Error', pinSecurity.error || 'Failed to enable biometric authentication');
      }
    } else {
      const success = await pinSecurity.disableBiometric();
      if (!success) {
        Alert.alert('Error', pinSecurity.error || 'Failed to disable biometric authentication');
      }
    }
  };

  const handleTimeoutChange = async (timeout: number) => {
    await pinSecurity.setInactivityTimeout(timeout);
    setShowTimeoutOptions(false);
  };

  const handleLockNow = () => {
    if (!pinSecurity.isPinSet) {
      Alert.alert('PIN Required', 'Please set up a PIN before locking the app');
      return;
    }

    Alert.alert(
      'Lock App',
      'Lock the app now? You will need to enter your PIN to unlock.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock',
          onPress: () => {
            // Navigate back to main screen before locking
            navigation.goBack();
            // Lock the app (PIN lock screen will appear via PinAuthGuard)
            setTimeout(() => {
              pinSecurity.lock();
            }, 100);
          },
        },
      ]
    );
  };

  const getTimeoutLabel = () => {
    const option = TIMEOUT_OPTIONS.find(opt => opt.value === pinSecurity.inactivityTimeout);
    return option?.label || '5 minutes';
  };

  const getBiometricType = () => {
    if (pinSecurity.biometricConfig.supportedTypes.includes('faceId')) {
      return 'Face ID';
    } else if (pinSecurity.biometricConfig.supportedTypes.includes('fingerprint')) {
      return 'Touch ID';
    }
    return 'Biometric';
  };

  const renderPinModal = () => {
    if (!modalMode) return null;

    let title = '';
    let description = '';

    if (modalMode === 'setup-pin') {
      if (currentStep === 'create') {
        title = 'Create PIN';
        description = `Enter a ${pinSecurity.pinLength}-digit PIN`;
      } else if (currentStep === 'confirm') {
        title = 'Confirm PIN';
        description = 'Re-enter your PIN to confirm';
      }
    } else if (modalMode === 'change-pin') {
      if (currentStep === 'verify') {
        title = 'Verify Current PIN';
        description = 'Enter your current PIN to continue';
      } else if (currentStep === 'create') {
        title = 'Create New PIN';
        description = `Enter a new ${pinSecurity.pinLength}-digit PIN`;
      } else if (currentStep === 'confirm') {
        title = 'Confirm New PIN';
        description = 'Re-enter your new PIN to confirm';
      }
    } else if (modalMode === 'disable-pin') {
      title = 'Verify PIN';
      description = 'Enter your PIN to disable PIN security';
    }

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isProcessing) {
            setModalMode(null);
            resetPinFlow();
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              {!isProcessing && (
                <TouchableOpacity
                  onPress={() => {
                    setModalMode(null);
                    resetPinFlow();
                  }}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.modalDescription}>{description}</Text>

            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#0066A1" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.pinInputContainer}>
                <PinInput
                  key={`${modalMode}-${currentStep}`}
                  length={pinSecurity.pinLength}
                  onComplete={handlePinComplete}
                  error={!!pinError}
                  errorMessage={pinError}
                  disabled={isProcessing}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimeoutModal = () => (
    <Modal
      visible={showTimeoutOptions}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTimeoutOptions(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Auto-Lock Timeout</Text>
            <TouchableOpacity onPress={() => setShowTimeoutOptions(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.timeoutList}>
            {TIMEOUT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeoutOption,
                  pinSecurity.inactivityTimeout === option.value && styles.timeoutOptionActive,
                ]}
                onPress={() => handleTimeoutChange(option.value)}
              >
                <Text
                  style={[
                    styles.timeoutOptionText,
                    pinSecurity.inactivityTimeout === option.value && styles.timeoutOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {pinSecurity.inactivityTimeout === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#0066A1" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={48} color="#0066A1" />
          <Text style={styles.headerTitle}>Security PIN</Text>
          <Text style={styles.headerDescription}>
            Protect your account with a PIN and biometric authentication
          </Text>
        </View>

        {/* PIN Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIN Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: pinSecurity.isPinSet ? '#ecfdf5' : '#fef2f2' },
                ]}
              >
                <Ionicons
                  name={pinSecurity.isPinSet ? 'lock-closed' : 'lock-open-outline'}
                  size={24}
                  color={pinSecurity.isPinSet ? '#10b981' : '#ef4444'}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {pinSecurity.isPinSet ? 'PIN Enabled' : 'PIN Disabled'}
                </Text>
                <Text style={styles.statusDescription}>
                  {pinSecurity.isPinSet
                    ? `${pinSecurity.pinLength}-digit PIN is active`
                    : 'No PIN configured'}
                </Text>
              </View>
            </View>
            {pinSecurity.isPinSet && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: '#10b981' }]}>Active</Text>
              </View>
            )}
          </View>
        </View>

        {/* PIN Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIN Management</Text>

          {!pinSecurity.isPinSet ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleSetupPin}>
              <View style={styles.actionButtonLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="add-circle-outline" size={20} color="#10b981" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Set Up PIN</Text>
                  <Text style={styles.actionDescription}>Create a PIN to secure your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleChangePin}>
                <View style={styles.actionButtonLeft}>
                  <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="swap-horizontal-outline" size={20} color="#0066A1" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Change PIN</Text>
                    <Text style={styles.actionDescription}>Update your security PIN</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleDisablePin}>
                <View style={styles.actionButtonLeft}>
                  <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
                    <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Disable PIN</Text>
                    <Text style={styles.actionDescription}>Remove PIN security</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Biometric Authentication */}
        {pinSecurity.biometricConfig.isAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biometric Authentication</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons
                    name={
                      pinSecurity.biometricConfig.supportedTypes.includes('faceId')
                        ? 'scan-outline'
                        : 'finger-print-outline'
                    }
                    size={20}
                    color="#0066A1"
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{getBiometricType()}</Text>
                  <Text style={styles.settingDescription}>
                    Use {getBiometricType()} for quick access
                  </Text>
                </View>
              </View>
              <Switch
                value={pinSecurity.isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#d1d5db', true: '#0066A1' }}
                thumbColor="#ffffff"
                disabled={!pinSecurity.isPinSet}
              />
            </View>
          </View>
        )}

        {/* Auto-Lock Settings */}
        {pinSecurity.isPinSet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auto-Lock</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowTimeoutOptions(true)}
            >
              <View style={styles.actionButtonLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#fffbeb' }]}>
                  <Ionicons name="time-outline" size={20} color="#f59e0b" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Auto-Lock Timeout</Text>
                  <Text style={styles.actionDescription}>{getTimeoutLabel()}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLockNow}>
              <View style={styles.actionButtonLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#ef4444" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Lock App Now</Text>
                  <Text style={styles.actionDescription}>Immediately lock the app</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0066A1" />
          <Text style={styles.infoText}>
            PIN security helps protect your account even if someone has access to your device. For
            maximum security, enable both PIN and biometric authentication.
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderPinModal()}
      {renderTimeoutModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.select({ ios: 40, android: 24 }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pinInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  processingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  timeoutList: {
    maxHeight: 400,
  },
  timeoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeoutOptionActive: {
    backgroundColor: '#f0f9ff',
  },
  timeoutOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  timeoutOptionTextActive: {
    color: '#0066A1',
    fontWeight: '600',
  },
});
