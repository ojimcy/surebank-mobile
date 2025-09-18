/**
 * Announcements Component
 * Dynamic notification system with horizontal slider and auto-play
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AnnouncementsProps, Announcement } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Account for horizontal padding

interface AnnouncementCardProps {
    announcement: Announcement;
    onDismiss: (id: string) => void;
    onPress: (announcement: Announcement) => void;
}

const AnnouncementCard = ({ announcement, onDismiss, onPress }: AnnouncementCardProps) => {
    const getIconName = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'warning':
                return 'warning-outline';
            case 'success':
                return 'checkmark-circle-outline';
            case 'error':
                return 'alert-circle-outline';
            default:
                return 'information-circle-outline';
        }
    };

    const getIconColor = (type: string): string => {
        switch (type) {
            case 'warning':
                return '#f59e0b';
            case 'success':
                return '#10b981';
            case 'error':
                return '#ef4444';
            default:
                return '#3b82f6';
        }
    };

    const getBackgroundColor = (type: string): string => {
        switch (type) {
            case 'warning':
                return '#fffbeb';
            case 'success':
                return '#ecfdf5';
            case 'error':
                return '#fef2f2';
            default:
                return '#eff6ff';
        }
    };

    const getBorderColor = (type: string): string => {
        switch (type) {
            case 'warning':
                return '#fde68a';
            case 'success':
                return '#bbf7d0';
            case 'error':
                return '#fecaca';
            default:
                return '#dbeafe';
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.announcementCard,
                {
                    backgroundColor: getBackgroundColor(announcement.type),
                    borderColor: getBorderColor(announcement.type),
                },
            ]}
            onPress={() => onPress(announcement)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Ionicons
                        name={getIconName(announcement.type)}
                        size={20}
                        color={getIconColor(announcement.type)}
                    />
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                </View>
                {announcement.dismissible && (
                    <TouchableOpacity
                        onPress={() => onDismiss(announcement.id)}
                        style={styles.dismissButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={16} color="#6b7280" />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.announcementDescription}>
                {announcement.description}
            </Text>
            {announcement.cta && (
                <TouchableOpacity
                    onPress={announcement.cta.action}
                    style={[
                        styles.ctaButton,
                        { backgroundColor: getIconColor(announcement.type) },
                    ]}
                >
                    <Text style={styles.ctaButtonText}>{announcement.cta.text}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

export default function Announcements({
    announcements,
    onDismiss,
    onAnnouncementPress,
}: AnnouncementsProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [autoplayEnabled, setAutoplayEnabled] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Handle slide change
    const handleSlideChange = useCallback(
        (index: number) => {
            setActiveSlide(index);
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: index * CARD_WIDTH,
                    animated: true,
                });
            }
        },
        []
    );

    // Setup and cleanup auto slide timer
    useEffect(() => {
        // Clear any existing interval when dependencies change
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Only set up the interval if we have announcements and autoplay is enabled
        if (announcements.length > 1 && autoplayEnabled) {
            intervalRef.current = setInterval(() => {
                const nextSlide = (activeSlide + 1) % announcements.length;
                handleSlideChange(nextSlide);
            }, 5000);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [activeSlide, announcements.length, handleSlideChange, autoplayEnabled]);

    // Handle manual scroll
    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
        if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < announcements.length) {
            setActiveSlide(slideIndex);
        }
    };

    // Pause/resume autoplay
    const handleTouchStart = () => setAutoplayEnabled(false);
    const handleTouchEnd = () => setAutoplayEnabled(true);

    if (!announcements || announcements.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Announcements</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                scrollEventThrottle={16}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {announcements.map((announcement) => (
                    <View key={announcement.id} style={styles.slideContainer}>
                        <AnnouncementCard
                            announcement={announcement}
                            onDismiss={onDismiss}
                            onPress={onAnnouncementPress}
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            {announcements.length > 1 && (
                <View style={styles.paginationContainer}>
                    {announcements.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.paginationDot,
                                activeSlide === index && styles.paginationDotActive,
                            ]}
                            onPress={() => handleSlideChange(index)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    scrollView: {
        // ScrollView styles
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    slideContainer: {
        width: CARD_WIDTH,
    },
    announcementCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    dismissButton: {
        padding: 4,
    },
    announcementDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    ctaButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    ctaButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
    },
    paginationDotActive: {
        backgroundColor: '#0066A1',
        width: 24,
    },
});
