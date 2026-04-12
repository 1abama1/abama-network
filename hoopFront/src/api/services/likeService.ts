import axiosInstance from '../axiosConfig';

export const likeService = {
    likePost(postId: number) {
        return axiosInstance.post(`/posts/${postId}/like`);
    },
    unlikePost(postId: number) {
        return axiosInstance.delete(`/posts/${postId}/like`);
    },
};
