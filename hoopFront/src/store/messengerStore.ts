// src/store/messengerStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
    Conversation, Message, TypingEvent,
    PresenceEvent, MessageAckEvent, MessageDeletedEvent,
} from '../types/messenger';

interface MessengerState {
    conversations: Conversation[];
    // messagesByConv: { [convId]: Message[] } — в хронологическом порядке
    messagesByConv: Record<number, Message[]>;
    // cursors для пагинации: convId → oldest sentAt (для следующей загрузки)
    cursorsByConv: Record<number, string | null>;
    hasMoreByConv: Record<number, boolean>;
    activeConvId: number | null;
    typingByConv: Record<number, string[]>;  // convId → username[]
    loading: boolean;
    error: string | null;
}

interface MessengerActions {
    setConversations: (convs: Conversation[]) => void;
    setActiveConv: (id: number | null) => void;
    prependMessages: (convId: number, msgs: Message[], hasMore: boolean) => void;
    addMessage: (msg: Message) => void;
    confirmMessage: (ack: MessageAckEvent) => void;
    markMessageError: (tempId: string) => void;
    deleteMessage: (evt: MessageDeletedEvent) => void;
    markConvRead: (convId: number) => void;
    updatePresence: (evt: PresenceEvent) => void;
    updateTyping: (evt: TypingEvent) => void;
    setLoading: (v: boolean) => void;
    setError: (msg: string | null) => void;
}

export const useMessengerStore = create<MessengerState & MessengerActions>()(
    immer((set) => ({
        // ── initial state ──────────────────────────────────────────────────────
        conversations: [],
        messagesByConv: {},
        cursorsByConv: {},
        hasMoreByConv: {},
        activeConvId: null,
        typingByConv: {},
        loading: false,
        error: null,

        // ── actions ────────────────────────────────────────────────────────────
        setConversations: (convs: Conversation[]) =>
            set((s: MessengerState) => { s.conversations = convs; }),

        setActiveConv: (id: number | null) =>
            set((s: MessengerState) => { s.activeConvId = id; }),

        /** Prepend — подгружаем историю (более старые) */
        prependMessages: (convId: number, msgs: Message[], hasMore: boolean) =>
            set((s: MessengerState) => {
                const existing = s.messagesByConv[convId] ?? [];
                // Дедупликация по id
                const ids = new Set(existing.map((m: Message) => m.id));
                const fresh = msgs.filter((m: Message) => !ids.has(m.id));
                s.messagesByConv[convId] = [...fresh, ...existing];
                s.hasMoreByConv[convId] = hasMore;
                if (msgs.length > 0) {
                    s.cursorsByConv[convId] = msgs[0].sentAt; // самое старое
                }
            }),

        /** Append — новое входящее или исходящее (оптимистичное) */
        addMessage: (msg: Message) =>
            set((s: MessengerState) => {
                const list = s.messagesByConv[msg.conversationId] ?? [];
                // Avoid dup
                if (list.some((m: Message) => m.id === msg.id)) return;
                s.messagesByConv[msg.conversationId] = [...list, msg];

                // Обновляем превью диалога
                const conv = s.conversations.find((c: Conversation) => c.id === msg.conversationId);
                if (conv) {
                    conv.lastMessage = msg.content;
                    conv.lastMessageAt = msg.sentAt;
                    // Если не мы отправили и диалог не активен — инкрементируем счётчик
                    // (точный счётчик придёт с сервера, это локальный оптимизм)
                    if (msg.pending === false && s.activeConvId !== msg.conversationId) {
                        conv.unreadCount += 1;
                    }
                }
            }),

        /** Сервер подтвердил доставку — заменяем temp-id на реальный */
        confirmMessage: (ack: MessageAckEvent) =>
            set((s: MessengerState) => {
                for (const convIdStr in s.messagesByConv) {
                    const convId = Number(convIdStr);
                    const list = s.messagesByConv[convId];
                    const idx = list.findIndex((m: Message) => m.clientTempId === ack.clientTempId);
                    if (idx !== -1) {
                        list[idx] = {
                            ...list[idx],
                            id: ack.serverId,
                            sentAt: ack.sentAt,
                            pending: false,
                        };
                        break;
                    }
                }
            }),

        markMessageError: (tempId: string) =>
            set((s: MessengerState) => {
                for (const convIdStr in s.messagesByConv) {
                    const convId = Number(convIdStr);
                    const list = s.messagesByConv[convId];
                    const idx = list.findIndex((m: Message) => m.clientTempId === tempId);
                    if (idx !== -1) { list[idx].error = true; break; }
                }
            }),

        deleteMessage: (evt: MessageDeletedEvent) =>
            set((s: MessengerState) => {
                const list = s.messagesByConv[evt.conversationId];
                if (!list) return;
                const idx = list.findIndex((m: Message) => m.id === evt.messageId);
                if (idx !== -1) list.splice(idx, 1);
            }),

        markConvRead: (convId: number) =>
            set((s: MessengerState) => {
                const conv = s.conversations.find((c: Conversation) => c.id === convId);
                if (conv) conv.unreadCount = 0;

                const list = s.messagesByConv[convId];
                if (list) list.forEach((m: Message) => { if (!m.readAt) m.readAt = new Date().toISOString(); });
            }),

        updatePresence: (evt: PresenceEvent) =>
            set((s: MessengerState) => {
                const conv = s.conversations.find((c: Conversation) => c.partnerUsername === evt.username);
                if (conv) conv.partnerOnline = evt.online;
            }),

        updateTyping: (evt: TypingEvent) =>
            set((s: MessengerState) => {
                const list = s.typingByConv[evt.conversationId] ?? [];
                if (evt.typing) {
                    if (!list.includes(evt.senderUsername))
                        s.typingByConv[evt.conversationId] = [...list, evt.senderUsername];
                } else {
                    s.typingByConv[evt.conversationId] = list.filter((u: string) => u !== evt.senderUsername);
                }
            }),

        setLoading: (v: boolean) => set((s: MessengerState) => { s.loading = v; }),
        setError: (m: string | null) => set((s: MessengerState) => { s.error = m; }),
    }))
);
