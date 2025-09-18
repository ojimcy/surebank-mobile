/**
 * SureBank Onboarding Screen
 *
 * Multi-step onboarding flow that introduces users to SureBank
 * with swipeable screens and navigation controls.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  ViewToken,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { storage, STORAGE_KEYS } from '@/services/storage/index';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  illustration?: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to SureBank',
    subtitle: 'Your Trusted Financial Partner',
    description: 'Experience modern banking with secure savings, smart investments, and financial growth tools designed for your success.',
    icon: 'shield-checkmark',
    gradient: ['#0066A1', '#0077B5', '#0088CC'],
  },
  {
    id: '2',
    title: 'Smart Savings',
    subtitle: 'Build Your Future Daily',
    description: 'Create consistent saving habits with our Daily Savings (DS) program. Small daily contributions lead to significant financial growth.',
    icon: 'calendar-outline',
    gradient: ['#0066A1', '#0077B5', '#0088CC'],
  },
  {
    id: '3',
    title: 'Goal-Based Savings',
    subtitle: 'Save for What Matters',
    description: 'Set and achieve specific financial goals with our Target Savings (SB). Save for products, vacations, or any dream you have.',
    icon: 'flag-outline',
    gradient: ['#0066A1', '#0077B5', '#0088CC'],
  },
  {
    id: '4',
    title: 'Competitive Returns',
    subtitle: 'Watch Your Money Grow',
    description: 'Earn attractive interest rates on your savings. The more you save, the more you earn with our competitive return programs.',
    icon: 'trending-up-outline',
    gradient: ['#0066A1', '#0077B5', '#0088CC'],
  },
  {
    id: '5',
    title: 'Bank-Level Security',
    subtitle: 'Your Money is Safe',
    description: 'Advanced encryption, biometric security, and regulatory compliance ensure your financial information is always protected.',
    icon: 'lock-closed-outline',
    gradient: ['#0066A1', '#0077B5', '#0088CC'],
  },
];

function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const markOnboardingComplete = async () => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    navigation.navigate('Register');
  };

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      // Add subtle animation before transitioning
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    navigation.navigate('Register');
  };

  const handleSignIn = async () => {
    await markOnboardingComplete();
    navigation.navigate('Login');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isLastSlide = index === onboardingSlides.length - 1;

    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1">
        <LinearGradient
          colors={item.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <SafeAreaView className="flex-1">
            {/* Skip Button - Top Right */}
            {currentIndex < onboardingSlides.length - 1 && (
              <View className="absolute top-4 right-6 z-10">
                <TouchableOpacity
                  onPress={handleSkip}
                  className="px-4 py-2"
                >
                  <Text className="text-white/90 text-base font-medium">Skip</Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-1 px-6">
              {/* Top spacing */}
              <View className="h-16" />

              {/* Illustration Area - Centered with better proportions */}
              <View className="flex-1 items-center justify-center max-h-[45%]">
                <Animated.View
                  className="items-center"
                  style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                  }}
                >
                  {/* Enhanced icon container with glow effect */}
                  <View className="w-40 h-40 bg-white/15 rounded-full items-center justify-center mb-6 shadow-2xl">
                    <View className="w-36 h-36 bg-white/10 rounded-full items-center justify-center">
                      <View className="w-32 h-32 bg-white/5 rounded-full items-center justify-center">
                        <Ionicons name={item.icon} size={72} color="white" />
                      </View>
                    </View>
                  </View>

                  {/* Optional: Add custom illustrations here */}
                  {item.illustration && (
                    <Image
                      source={{ uri: item.illustration }}
                      className="w-72 h-72 absolute"
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </View>

              {/* Content Area - Better spacing and typography */}
              <View className={`flex-1 justify-center max-h-[45%] ${isLastSlide ? 'pb-36' : 'pb-24'}`}>
                <View className="items-center">
                  <Text className="text-4xl font-black text-white text-center mb-4 tracking-tight leading-tight">
                    {item.title}
                  </Text>

                  <Text className="text-xl font-semibold text-white/95 text-center mb-6 leading-relaxed">
                    {item.subtitle}
                  </Text>

                  <Text className="text-lg text-white/85 text-center leading-7 px-2 max-w-sm font-medium">
                    {item.description}
                  </Text>

                  {/* Call to Action for Last Slide */}
                  {isLastSlide && (
                    <View className="mt-10 w-full max-w-sm">
                      <TouchableOpacity
                        onPress={handleGetStarted}
                        className="bg-white px-8 py-5 rounded-2xl items-center shadow-xl mb-4"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 12,
                          elevation: 8,
                        }}
                      >
                        <Text className="text-gray-900 text-xl font-bold">
                          Create Account
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSignIn}
                        className="bg-white/15 border-2 border-white/60 px-8 py-5 rounded-2xl items-center backdrop-blur-sm"
                      >
                        <Text className="text-white text-xl font-semibold">
                          I already have an account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={32}
      />

      {/* Navigation Controls */}
      <View className="absolute bottom-0 left-0 right-0 pb-12 px-6">
        {/* Progress Indicators */}
        <View className="flex-row justify-center mb-8">
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              className={`h-2 mx-1 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'w-8 bg-white'
                : index < currentIndex
                  ? 'w-6 bg-white/60'
                  : 'w-2 bg-white/30'
                }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center">
          {/* Back Button */}
          {currentIndex > 0 ? (
            <TouchableOpacity
              onPress={handleBack}
              className="px-4 py-3"
            >
              <Text className="text-white text-base font-medium">Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          {/* Next Button (not on last slide) */}
          {currentIndex < onboardingSlides.length - 1 ? (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-white px-8 py-3 rounded-lg"
            >
              <Text className="text-gray-900 text-base font-semibold">Next</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>
      </View>
    </View>
  );
}

export default OnboardingScreen;