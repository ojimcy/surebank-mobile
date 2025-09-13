/**
 * SureBank Authentication Screen
 * 
 * Main authentication screen with tabbed interface for
 * login and registration flows.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StatusBar,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { withActivityTracking } from '@/components/security/ActivityTracker';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import clsx from 'clsx';

type Props = NativeStackScreenProps<AuthStackParamList, 'Authentication'>;

type TabType = 'login' | 'register';

function AuthenticationScreen({ navigation, route }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(
    route.params?.initialTab || 'login'
  );

  // Update tab when route params change
  useEffect(() => {
    if (route.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab, activeTab]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLoginSuccess = () => {
    // Navigation will be handled by the auth context
    // This is just for any additional actions needed
    console.log('Login successful');
  };

  const handleRegisterSuccess = (identifier: string) => {
    // Navigate to verification screen
    navigation.navigate('Verification', { identifier });
  };

  const handleForgotPassword = () => {
    navigation.navigate('PasswordRecovery');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

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
          
          <View className="items-center">
            <View className="w-10 h-10 bg-primary-600 rounded-xl items-center justify-center">
              <Ionicons name="shield-checkmark" size={20} color="white" />
            </View>
          </View>
          
          <View className="w-10" />
        </View>

        {/* Tab Navigation */}
        <View className="px-6 mb-8">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <TabButton
              title="Sign In"
              isActive={activeTab === 'login'}
              onPress={() => setActiveTab('login')}
            />
            <TabButton
              title="Create Account"
              isActive={activeTab === 'register'}
              onPress={() => setActiveTab('register')}
            />
          </View>
        </View>

        {/* Tab Content */}
        <View className="flex-1">
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={handleForgotPassword}
              onSwitchToRegister={handleSwitchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Tab button component
interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ title, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'flex-1 py-3 px-4 rounded-lg items-center justify-center',
        isActive ? 'bg-white shadow-sm' : 'bg-transparent'
      )}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={title}
    >
      <Text 
        className={clsx(
          'font-semibold',
          isActive ? 'text-gray-900' : 'text-gray-500'
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default withActivityTracking(AuthenticationScreen);