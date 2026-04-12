import axiosInstance from '../axiosConfig';
import type { Notification } from '../../types/notification';
import type { Page } from './types';

export const notificationService = {
    getNotifications(page = 0, size = 20) {
        return axiosInstance.get<Page<Notification>>('/notifications', { params: { page, size } });
    },
    getUnreadCount() {
        return axiosInstance.get<number>('/notifications/unread-count');
    },
    markAllRead() {
        return axiosInstance.put('/notifications/read-all');
    },
};
