/**
 * Notification Context
 * Manages notification state and badge count
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextValue {
    unreadCount: number;
    hasUnreadNotifications: boolean;
    markAllAsRead: () => void;
    addNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [unreadCount, setUnreadCount] = useState(3); // Mock initial count

    const hasUnreadNotifications = unreadCount > 0;

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    const addNotification = () => {
        setUnreadCount(prev => prev + 1);
    };

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                hasUnreadNotifications,
                markAllAsRead,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
