import axiosInstance from '../axiosConfig';
import type { Comment } from '../../types/post';

export const commentService = {
    addComment(postId: number, content: string) {
        return axiosInstance.post<Comment>(`/posts/${postId}/comment`, { content });
    },
    getComments(postId: number) {
        return axiosInstance.get<Comment[]>(`/posts/${postId}/comments`);
    },
};
