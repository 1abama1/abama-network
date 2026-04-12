import axiosInstance from '../axiosConfig';
import type { Post } from '../../types/post';

export const repostService = {
    repost(postId: number, caption?: string | null) {
        return axiosInstance.post<Post>(`/posts/${postId}/repost`, caption !== undefined ? { caption } : null);
    },
};
