import axiosInstance from '../axiosConfig';
import type { Conversation, Message } from '../../types/messenger';
import type { UserSummary } from '../../types/user';

export const conversationService = {
    getConversations() {
        return axiosInstance.get<Conversation[]>('/conversations');
    },
    getMessages(conversationId: number, limit = 50) {
        return axiosInstance.get<Message[]>(`/conversations/${conversationId}/messages`, { params: { limit } });
    },
    sendMessage(receiver: string, content: string, clientTempId: string) {
        return axiosInstance.post(`/conversations/messages?receiver=${receiver}`, { content, clientTempId });
    },
    sendMessageToConversation(conversationId: number, content: string, clientTempId: string) {
        return axiosInstance.post(`/conversations/${conversationId}/messages`, { content, clientTempId });
    },
    markRead(conversationId: number) {
        return axiosInstance.put(`/conversations/${conversationId}/read`);
    },
    getMutuals() {
        return axiosInstance.get<UserSummary[]>('/conversations/mutuals');
    },
};
