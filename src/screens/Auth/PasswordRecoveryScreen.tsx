/**
 * SureBank Password Recovery Screen
 * 
 * Complete password recovery flow with email input, code verification,
 * and new password setup in a multi-step process.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { withActivityTracking } from '@/components/security/ActivityTracker';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import EmailStepComponent from './components/PasswordRecovery/EmailStep';
import CodeStepComponent from './components/PasswordRecovery/CodeStep';
import NewPasswordStepComponent from './components/PasswordRecovery/NewPasswordStep';
import SuccessStepComponent from './components/PasswordRecovery/SuccessStep';

type Props = NativeStackScreenProps<AuthStackParamList, 'PasswordRecovery'>;

type RecoveryStep = 'email' | 'code' | 'password' | 'success';

function PasswordRecoveryScreen({ navigation, route }: Props) {
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const { pendingLink } = useDeepLinking();

  // Handle deep link parameters
  useEffect(() => {
    const params = route.params as any;
    
    // Check for deep link parameters
    if (params?.fromDeepLink && params?.email && params?.token) {
      setEmail(params.email);
      setResetCode(params.token);
      
      // Skip to password step if we have a valid token
      setCurrentStep('password');
      
      Alert.alert(
        'Reset Link Opened',
        'You can now set your new password.',
        [{ text: 'Continue' }]
      );
    }
    
    // Check for pending deep link
    if (pendingLink?.type === 'password_reset') {
      if (pendingLink.email && pendingLink.token) {
        setEmail(pendingLink.email);
        setResetCode(pendingLink.token);
        setCurrentStep('password');
        
        Alert.alert(
          'Reset Link Opened',
          'You can now set your new password.',
          [{ text: 'Continue' }]
        );
      }
    }
  }, [route.params, pendingLink]);

  const handleBackPress = () => {
    if (currentStep === 'email') {
      navigation.goBack();
    } else {
      // Go back to previous step
      const stepOrder: RecoveryStep[] = ['email', 'code', 'password', 'success'];
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  const handleEmailSubmit = (emailAddress: string) => {
    setEmail(emailAddress);
    setCurrentStep('code');
  };

  const handleCodeVerified = (code: string) => {
    setResetCode(code);
    setCurrentStep('password');
  };

  const handlePasswordReset = () => {
    setCurrentStep('success');
  };

  const handleComplete = () => {
    navigation.navigate('Authentication', { initialTab: 'login' });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Reset Password';
      case 'code':
        return 'Enter Code';
      case 'password':
        return 'New Password';
      case 'success':
        return 'Password Reset';
      default:
        return 'Reset Password';
    }
  };

  const getStepProgress = () => {
    const steps = ['email', 'code', 'password', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={handleBackPress}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            
            <Text className="text-lg font-semibold text-gray-900">
              {getStepTitle()}
            </Text>
            
            <View className="w-10" />
          </View>

          {/* Progress Bar */}
          {currentStep !== 'success' && (
            <View className="mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-500">
                  Step {['email', 'code', 'password'].indexOf(currentStep) + 1} of 3
                </Text>
                <Text className="text-sm text-gray-500">
                  {Math.round(getStepProgress())}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Step Content */}
        <View className="flex-1">
          {currentStep === 'email' && (
            <EmailStepComponent onSubmit={handleEmailSubmit} />
          )}
          
          {currentStep === 'code' && (
            <CodeStepComponent 
              email={email}
              onVerified={handleCodeVerified}
              onResendEmail={() => setCurrentStep('email')}
            />
          )}
          
          {currentStep === 'password' && (
            <NewPasswordStepComponent
              email={email}
              resetCode={resetCode}
              onSuccess={handlePasswordReset}
            />
          )}
          
          {currentStep === 'success' && (
            <SuccessStepComponent onComplete={handleComplete} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default withActivityTracking(PasswordRecoveryScreen);