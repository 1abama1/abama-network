import { useEffect, useRef, useCallback } from 'react';
import { wsService, initWebSocket } from '../api/websocket';
import { useMessengerStore } from '../store/messengerStore';
import type {
    Message, TypingEvent, ReadReceiptEvent,
    PresenceEvent, MessageAckEvent, MessageDeletedEvent,
} from '../types/messenger';

const PING_MS = 30_000;

export function useMessengerSocket(token: string | null) {
    const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const {
        addMessage, confirmMessage,
        deleteMessage, updatePresence, updateTyping, markConvRead,
    } = useMessengerStore();

    useEffect(() => {
        if (!token) return;

        const setup = async () => {
            await initWebSocket();

            wsService.subscribe('/user/queue/messages', (data: Message) => {
                addMessage(data);
            });

            wsService.subscribe('/user/queue/message-ack', (data: MessageAckEvent) => {
                confirmMessage(data);
            });

            wsService.subscribe('/user/queue/message-deleted', (data: MessageDeletedEvent) => {
                deleteMessage(data);
            });

            wsService.subscribe('/user/queue/read-receipt', (data: ReadReceiptEvent) => {
                markConvRead(data.conversationId);
            });

            wsService.subscribe('/user/queue/typing', (data: TypingEvent) => {
                updateTyping(data);
            });

            wsService.subscribe('/topic/presence', (data: PresenceEvent) => {
                updatePresence(data);
            });

            pingRef.current = setInterval(() => {
                wsService.publish('/app/presence.ping', {});
            }, PING_MS);
        };

        setup();

        return () => {
            if (pingRef.current) clearInterval(pingRef.current);
            wsService.unsubscribe('/user/queue/messages');
            wsService.unsubscribe('/user/queue/message-ack');
            wsService.unsubscribe('/user/queue/message-deleted');
            wsService.unsubscribe('/user/queue/read-receipt');
            wsService.unsubscribe('/user/queue/typing');
            wsService.unsubscribe('/topic/presence');
        };
    }, [token, addMessage, confirmMessage, deleteMessage, updatePresence, updateTyping, markConvRead]);

    const sendMessage = useCallback(
        (targetUsername: string, content: string, clientTempId: string) => {
            wsService.publish('/app/message.send', { targetUsername, content, clientTempId });
        },
        []
    );

    const sendTypingStart = useCallback((conversationId: number) => {
        wsService.publish('/app/typing.start', { conversationId });
    }, []);

    const sendTypingStop = useCallback((conversationId: number) => {
        wsService.publish('/app/typing.stop', { conversationId });
    }, []);

    return { sendMessage, sendTypingStart, sendTypingStop };
}
