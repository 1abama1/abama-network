import axiosInstance from '../axiosConfig';
import type { AuthResponse } from '../../types/auth';

export const authService = {
    login(identifier: string, password: string) {
        return axiosInstance.post<AuthResponse>('/auth/login', { identifier, password });
    },
    register(username: string, email: string, password: string) {
        return axiosInstance.post('/auth/register', { username, email, password });
    },
    verifyOtp(identifier: string, code: string) {
        return axiosInstance.post('/auth/verify-otp', { identifier, code });
    },
    resendOtp(identifier: string) {
        return axiosInstance.post('/auth/resend-otp', { identifier });
    },
    forgotPassword(email: string) {
        return axiosInstance.post('/auth/forgot-password', { email });
    },
    resetPassword(identifier: string, code: string, newPassword: string) {
        return axiosInstance.post('/auth/reset-password', { identifier, code, newPassword });
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
