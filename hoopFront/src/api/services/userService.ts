import axiosInstance from '../axiosConfig';
import type { Profile, UserSummary } from '../../types/user';

export const userService = {
    getProfile(username: string) {
        return axiosInstance.get<Profile>(`/users/${username}`);
    },
    updateProfile(data: { bio?: string; height?: number; weight?: number; jump?: number; positions?: string[] }) {
        return axiosInstance.post<Profile>('/users/profile', data);
    },
    follow(username: string) {
        return axiosInstance.post(`/users/${username}/follow`);
    },
    unfollow(username: string) {
        return axiosInstance.delete(`/users/${username}/follow`);
    },
    getFollowers(username: string) {
        return axiosInstance.get<UserSummary[]>(`/users/${username}/followers`);
    },
    getFollowing(username: string) {
        return axiosInstance.get<UserSummary[]>(`/users/${username}/following`);
    },
    searchUsers(query: string) {
        return axiosInstance.get<UserSummary[]>('/users/search', { params: { query } });
    },
    getRecommended() {
        return axiosInstance.get<UserSummary[]>('/users/recommended');
    },
};
