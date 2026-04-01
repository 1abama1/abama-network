import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';
import { wsService, initWebSocket } from '../api/websocket';

export interface NotificationItem {
    id: number;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPOST' | 'GAME_JOIN';
    actor: {
        id: number;
        username: string;
        positions: string[];
        height: number;
        followersCount: number;
    };
    entityId: number;
    entityType: string;
    isRead: boolean;
    createdAt: string;
}

export const useNotifications = (username: string | undefined) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = useCallback(async () => {
        if (!username) return;
        try {
            const res = await axiosInstance.get('notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    }, [username]);

    const fetchNotifications = useCallback(async () => {
        if (!username) return;
        try {
            const res = await axiosInstance.get('notifications');
            setNotifications(res.data.content || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [username]);

    const markAllRead = async () => {
        try {
            await axiosInstance.put('notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    useEffect(() => {
        if (!username) return;

        fetchUnread();

        // Real-time notifications
        initWebSocket().then(() => {
            wsService.subscribe('/user/queue/notifications', (msg) => {
                const notification = msg as NotificationItem;
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        });

        return () => {
            wsService.unsubscribe('/user/queue/notifications');
        };
    }, [username, fetchUnread]);

    return { notifications, unreadCount, fetchNotifications, markAllRead };
};
