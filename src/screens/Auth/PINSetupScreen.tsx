/**
 * SureBank PIN Setup Screen
 * 
 * PIN setup screen with biometric integration for enhanced security.
 * Users can set up a 4 or 6-digit PIN with optional biometric authentication.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { PinInput } from '@/components/security';
import { PrimaryButton, OutlineButton, Checkbox } from '@/components/forms';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { withActivityTracking, useActivityTracking } from '@/components/security/ActivityTracker';
import clsx from 'clsx';

type Props = NativeStackScreenProps<AuthStackParamList, 'PINSetup'>;

type SetupStep = 'intro' | 'create' | 'confirm' | 'biometric' | 'complete';

function PINSetupScreen({ navigation }: Props) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('intro');
  const [pinLength, setPinLength] = useState<4 | 6>(6);
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { trackFormSubmission } = useActivityTracking();
  const pinSecurity = usePinSecurity();

  const handleBackPress = () => {
    if (currentStep === 'intro') {
      navigation.goBack();
    } else {
      // Go to previous step
      const stepOrder: SetupStep[] = ['intro', 'create', 'confirm', 'biometric', 'complete'];
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(stepOrder[currentIndex - 1]);
        setErrorMessage('');
      }
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip PIN Setup',
      'Are you sure you want to skip PIN setup? You can set it up later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            // Navigate to main app (this would be handled by navigation logic)
            console.log('Skip PIN setup');
          }
        },
      ]
    );
  };

  const handleStartSetup = () => {
    setCurrentStep('create');
  };

  const handleFirstPinComplete = (pin: string) => {
    setFirstPin(pin);
    setCurrentStep('confirm');
    setErrorMessage('');
  };

  const handleConfirmPinComplete = (pin: string) => {
    if (pin === firstPin) {
      setConfirmPin(pin);
      
      // Check if biometric is available
      if (pinSecurity.biometricConfig.isAvailable) {
        setCurrentStep('biometric');
      } else {
        handleCompletePinSetup(false);
      }
    } else {
      setErrorMessage('PINs do not match. Please try again.');
      setConfirmPin('');
    }
  };

  const handleBiometricChoice = (enable: boolean) => {
    setEnableBiometric(enable);
    handleCompletePinSetup(enable);
  };

  const handleCompletePinSetup = async (biometricEnabled: boolean) => {
    try {
      trackFormSubmission();

      const success = await pinSecurity.setupPin(firstPin, biometricEnabled);
      
      if (success) {
        setCurrentStep('complete');
      } else {
        Alert.alert(
          'Setup Failed',
          pinSecurity.error || 'Failed to set up PIN. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Setup Failed',
        'An error occurred while setting up your PIN. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleComplete = () => {
    // Navigate to main app - this would be handled by the navigation logic
    console.log('PIN setup complete');
  };

  const renderIntroStep = () => (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-primary-100 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="shield-checkmark" size={48} color="#0066A1" />
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Secure your account
          </Text>
          
          <Text className="text-gray-600 text-center leading-6">
            Set up a PIN to quickly and securely access your SureBank account
          </Text>
        </View>

        {/* Features */}
        <View className="space-y-6 mb-12">
          <FeatureItem
            icon="flash-outline"
            title="Quick Access"
            description="Unlock your app instantly with your PIN"
          />
          
          <FeatureItem
            icon="shield-outline"
            title="Enhanced Security"
            description="Add an extra layer of protection to your account"
          />
          
          <FeatureItem
            icon="finger-print-outline"
            title="Biometric Support"
            description="Use Face ID or Touch ID for even faster access"
          />
        </View>

        {/* PIN Length Selection */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Choose PIN Length
          </Text>
          
          <View className="flex-row space-x-4">
            <PinLengthOption
              length={4}
              selected={pinLength === 4}
              onSelect={() => setPinLength(4)}
            />
            <PinLengthOption
              length={6}
              selected={pinLength === 6}
              onSelect={() => setPinLength(6)}
            />
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto space-y-4">
          <PrimaryButton
            title="Set Up PIN"
            onPress={handleStartSetup}
            size="lg"
            fullWidth
            leftIcon="lock-closed-outline"
          />
          
          <OutlineButton
            title="Skip for Now"
            onPress={handleSkip}
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderCreateStep = () => (
    <View className="flex-1 px-6 py-8">
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Create your PIN
        </Text>
        <Text className="text-gray-600 text-center">
          Enter a {pinLength}-digit PIN that you'll remember
        </Text>
      </View>

      <PinInput
        length={pinLength}
        onComplete={handleFirstPinComplete}
        errorMessage={errorMessage}
        accessibilityLabel="Create PIN"
        accessibilityHint={`Enter your ${pinLength}-digit PIN`}
      />
    </View>
  );

  const renderConfirmStep = () => (
    <View className="flex-1 px-6 py-8">
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Confirm your PIN
        </Text>
        <Text className="text-gray-600 text-center">
          Enter your PIN again to confirm
        </Text>
      </View>

      <PinInput
        length={pinLength}
        onComplete={handleConfirmPinComplete}
        error={!!errorMessage}
        errorMessage={errorMessage}
        accessibilityLabel="Confirm PIN"
        accessibilityHint="Re-enter your PIN to confirm"
      />
    </View>
  );

  const renderBiometricStep = () => (
    <View className="flex-1 px-6 py-8">
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
          <Ionicons 
            name={
              pinSecurity.biometricConfig.supportedTypes.includes('faceId')
                ? 'scan-outline'
                : 'finger-print-outline'
            } 
            size={40} 
            color="#0066A1" 
          />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Enable {pinSecurity.biometricConfig.supportedTypes.includes('faceId') ? 'Face ID' : 'Touch ID'}?
        </Text>
        
        <Text className="text-gray-600 text-center leading-6">
          Use biometric authentication for faster and more secure access to your account
        </Text>
      </View>

      <View className="mt-auto space-y-4">
        <PrimaryButton
          title={`Enable ${pinSecurity.biometricConfig.supportedTypes.includes('faceId') ? 'Face ID' : 'Touch ID'}`}
          onPress={() => handleBiometricChoice(true)}
          size="lg"
          fullWidth
          leftIcon={
            pinSecurity.biometricConfig.supportedTypes.includes('faceId')
              ? 'scan-outline'
              : 'finger-print-outline'
          }
        />
        
        <OutlineButton
          title="Use PIN Only"
          onPress={() => handleBiometricChoice(false)}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View className="flex-1 px-6 py-8 justify-center">
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          PIN setup complete!
        </Text>
        
        <Text className="text-gray-600 text-center leading-6">
          Your account is now secured with your PIN
          {enableBiometric && ` and ${pinSecurity.biometricConfig.supportedTypes.includes('faceId') ? 'Face ID' : 'Touch ID'}`}
        </Text>
      </View>

      <View className="space-y-4 mb-12">
        <Text className="text-center text-gray-500 text-sm">
          You can change these settings anytime in your account preferences
        </Text>
      </View>

      <PrimaryButton
        title="Continue"
        onPress={handleComplete}
        size="lg"
        fullWidth
        leftIcon="arrow-forward-outline"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={handleBackPress}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            PIN Setup
          </Text>
          
          {currentStep === 'intro' && (
            <Pressable onPress={handleSkip}>
              <Text className="text-primary-600 font-medium">Skip</Text>
            </Pressable>
          ) || <View className="w-10" />}
        </View>

        {/* Step Content */}
        {currentStep === 'intro' && renderIntroStep()}
        {currentStep === 'create' && renderCreateStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
        {currentStep === 'biometric' && renderBiometricStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </View>
    </SafeAreaView>
  );
}

// Feature item component
interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className="flex-row items-start">
      <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-4 flex-shrink-0">
        <Ionicons name={icon} size={24} color="#0066A1" />
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {title}
        </Text>
        <Text className="text-gray-600">
          {description}
        </Text>
      </View>
    </View>
  );
}

// PIN length option component
interface PinLengthOptionProps {
  length: 4 | 6;
  selected: boolean;
  onSelect: () => void;
}

function PinLengthOption({ length, selected, onSelect }: PinLengthOptionProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={clsx(
        'flex-1 p-4 rounded-lg border-2',
        selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
      )}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${length}-digit PIN`}
    >
      <View className="items-center">
        <Text className={clsx(
          'text-2xl font-bold mb-2',
          selected ? 'text-primary-700' : 'text-gray-400'
        )}>
          {Array(length).fill('●').join(' ')}
        </Text>
        <Text className={clsx(
          'font-semibold',
          selected ? 'text-primary-700' : 'text-gray-500'
        )}>
          {length} Digits
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-1">
          {length === 4 ? 'Quick & easy' : 'More secure'}
        </Text>
      </View>
    </Pressable>
  );
}

export default withActivityTracking(PINSetupScreen);