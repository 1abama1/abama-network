import { describe, it, expect, beforeEach } from 'vitest';
import { useMessengerStore } from '../store/messengerStore';

describe('messengerStore', () => {
    beforeEach(() => {
        const store = useMessengerStore.getState();
        store.setConversations([]);
        store.setActiveConv(null);
        store.setLoading(false);
        store.setError(null);
    });

    it('adds a message to the correct conversation', () => {
        const store = useMessengerStore.getState();
        store.setConversations([{
            id: 1,
            partnerUsername: 'alice',
            lastMessage: null,
            lastMessageAt: null,
            unreadCount: 0,
            partnerOnline: false,
        }]);

        const msg = {
            id: 100,
            conversationId: 1,
            senderUsername: 'bob',
            content: 'Hello',
            sentAt: new Date().toISOString(),
            readAt: null,
            pending: false,
        };

        store.addMessage(msg);

        const updated = useMessengerStore.getState();
        expect(updated.messagesByConv[1]).toHaveLength(1);
        expect(updated.messagesByConv[1][0].content).toBe('Hello');
    });

    it('sets active conversation', () => {
        useMessengerStore.getState().setActiveConv(5);
        expect(useMessengerStore.getState().activeConvId).toBe(5);
    });

    it('sets loading state', () => {
        useMessengerStore.getState().setLoading(true);
        expect(useMessengerStore.getState().loading).toBe(true);
    });
});
