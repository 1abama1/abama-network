import axiosInstance from '../axiosConfig';
import type { AuthResponse } from '../../types/auth';

export const authService = {
    login(identifier: string, password: string) {
        return axiosInstance.post<AuthResponse>('/auth/login', { identifier, password });
    },
    register(username: string, email: string, password: string) {
        return axiosInstance.post('/auth/register', { username, email, password });
    },
    refreshToken(refreshToken: string) {
        return axiosInstance.post<AuthResponse>('/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` }
        });
    },
    changePassword(currentPassword: string, newPassword: string) {
        return axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
    },
    logout() {
        return axiosInstance.post('/auth/logout');
    },
};
