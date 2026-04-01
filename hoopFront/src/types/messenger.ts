// src/types/messenger.ts

export interface Conversation {
    id: number;
    partnerUsername: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    partnerOnline: boolean;
}

export interface Message {
    id: number | string;     // string когда tempId
    conversationId: number;
    senderUsername: string;
    content: string;
    sentAt: string;
    readAt: string | null;
    pending?: boolean;        // оптимистичный
    error?: boolean;          // ошибка отправки
    clientTempId?: string;
}

export interface TypingEvent {
    senderUsername: string;
    conversationId: number;
    typing: boolean;
}

export interface ReadReceiptEvent {
    conversationId: number;
    readerUsername: string;
    readAt: string;
}

export interface PresenceEvent {
    username: string;
    online: boolean;
}

export interface MessageAckEvent {
    clientTempId: string;
    serverId: number;
    sentAt: string;
}

export interface MessageDeletedEvent {
    messageId: number;
    conversationId: number;
}
