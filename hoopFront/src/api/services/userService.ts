import axiosInstance from '../axiosConfig';
import type { Profile, UserSummary } from '../../types/user';

export const userService = {
  getProfile(username: string) {
    return axiosInstance.get<Profile>(`/users/profile/${username}`);
  },
  updateProfile(data: { bio?: string; height?: number; weight?: number; jump?: number; positions?: string[] }) {
    return axiosInstance.put<Profile>('/users/profile', data);
  },
  follow(username: string) {
    return axiosInstance.post(`/users/follow/${username}`);
  },
  unfollow(username: string) {
    return axiosInstance.delete(`/users/unfollow/${username}`);
  },
  getFollowers(username: string) {
    return axiosInstance.get<UserSummary[]>(`/users/followers/${username}`);
  },
  getFollowing(username: string) {
    return axiosInstance.get<UserSummary[]>(`/users/following/${username}`);
  },
  searchUsers(query: string) {
    return axiosInstance.get<UserSummary[]>('/users/search', { params: { q: query } });
  },
  getRecommended() {
    return axiosInstance.get<UserSummary[]>('/users/recommended');
  },
};
