/**
 * Image Viewer Screen
 * Full-screen image viewer with pinch-to-zoom and pan functionality
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import type { RootScreenProps } from '@/navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ImageViewerScreenRouteProp = RootScreenProps<'ImageViewer'>['route'];
type ImageViewerScreenNavigationProp = RootScreenProps<'ImageViewer'>['navigation'];

export default function ImageViewerScreen() {
    const route = useRoute<ImageViewerScreenRouteProp>();
    const navigation = useNavigation<ImageViewerScreenNavigationProp>();
    const { imageUri } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Animation values
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Pinch gesture for zooming
    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else if (scale.value > 4) {
                scale.value = withSpring(4);
                savedScale.value = 4;
            } else {
                savedScale.value = scale.value;
            }
        });

    // Pan gesture for moving zoomed image
    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .onUpdate((event) => {
            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    // Double tap to zoom in/out
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((event) => {
            if (scale.value > 1) {
                // Zoom out
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                // Zoom in to 2x at tap location
                const newScale = 2;
                scale.value = withSpring(newScale);
                savedScale.value = newScale;

                // Center on tap point
                const focalX = event.x - SCREEN_WIDTH / 2;
                const focalY = event.y - SCREEN_HEIGHT / 2;
                translateX.value = withSpring(-focalX * (newScale - 1));
                translateY.value = withSpring(-focalY * (newScale - 1));
                savedTranslateX.value = -focalX * (newScale - 1);
                savedTranslateY.value = -focalY * (newScale - 1);
            }
        });

    // Combine gestures
    const composedGesture = Gesture.Simultaneous(
        Gesture.Race(doubleTapGesture, panGesture),
        pinchGesture
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const handleClose = () => {
        navigation.goBack();
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Image Container */}
                <View style={styles.imageContainer}>
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    )}

                    {hasError ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="image-outline" size={80} color="#6b7280" />
                            <Text style={styles.errorText}>Failed to load image</Text>
                        </View>
                    ) : (
                        <GestureDetector gesture={composedGesture}>
                            <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.image}
                                    resizeMode="contain"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            </Animated.View>
                        </GestureDetector>
                    )}
                </View>

                {/* Instructions */}
                {!isLoading && !hasError && (
                    <View style={styles.instructions}>
                        <View style={styles.instructionItem}>
                            <Ionicons name="finger-print-outline" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.instructionText}>Pinch to zoom</Text>
                        </View>
                        <View style={styles.instructionDivider} />
                        <View style={styles.instructionItem}>
                            <Ionicons name="hand-left-outline" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.instructionText}>Double tap to zoom</Text>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 22,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
    },
    instructions: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    instructionText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    instructionDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});
