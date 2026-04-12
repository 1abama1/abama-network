import axiosInstance from '../axiosConfig';
import type { Post, Comment } from '../../types/post';
import type { Page } from './types';

export const postService = {
    createPost(content: string) {
        return axiosInstance.post<Post>('/posts', { content });
    },
    deletePost(postId: number) {
        return axiosInstance.delete(`/posts/${postId}`);
    },
    getPost(postId: number) {
        return axiosInstance.get<Post>(`/posts/${postId}`);
    },
    likePost(postId: number) {
        return axiosInstance.post(`/posts/${postId}/like`);
    },
    unlikePost(postId: number) {
        return axiosInstance.delete(`/posts/${postId}/like`);
    },
    addComment(postId: number, content: string) {
        return axiosInstance.post<Comment>(`/posts/${postId}/comment`, { content });
    },
    getComments(postId: number) {
        return axiosInstance.get<Comment[]>(`/posts/${postId}/comments`);
    },
    repost(postId: number, caption?: string | null) {
        return axiosInstance.post<Post>(`/posts/${postId}/repost`, caption !== undefined ? { caption } : null);
    },
    getFeed(page = 0, size = 20) {
        return axiosInstance.get<Page<Post>>('/posts/feed', { params: { page, size } });
    },
    getExplore(page = 0, size = 20) {
        return axiosInstance.get<Page<Post>>('/posts/explore', { params: { page, size } });
    },
    getUserPosts(username: string, page = 0, size = 20) {
        return axiosInstance.get<Page<Post>>(`/posts/user/${username}`, { params: { page, size } });
    },
    getLikedPosts(username: string, page = 0, size = 20) {
        return axiosInstance.get<Page<Post>>(`/posts/liked/${username}`, { params: { page, size } });
    },
    searchPosts(q: string, page = 0, size = 20) {
        return axiosInstance.get<Page<Post>>('/posts/search', { params: { q, page, size } });
    },
};
