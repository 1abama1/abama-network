// src/hooks/useMessengerSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMessengerStore } from '../store/messengerStore';
import type {
    Message, TypingEvent, ReadReceiptEvent,
    PresenceEvent, MessageAckEvent, MessageDeletedEvent,
} from '../types/messenger';

const getWsUrl = () => {
    const isProd = import.meta.env.PROD;
    if (isProd) {
        // In production (e.g. Docker/Nginx), use same host but /ws path
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        return `${protocol}//${window.location.host}/ws`;
    }
    // Development fallback
    return 'http://localhost:8080/ws';
};

const WS_URL = getWsUrl();
const PING_MS = 30_000;

export function useMessengerSocket(token: string | null) {
    const clientRef = useRef<Client | null>(null);
    const subRefs = useRef<StompSubscription[]>([]);
    const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnAtRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        addMessage, confirmMessage,
        deleteMessage, updatePresence, updateTyping, markConvRead,
    } = useMessengerStore.getState();

    const subscribe = useCallback((client: Client) => {
        const s = subRefs.current;

        // Входящие сообщения
        s.push(client.subscribe('/user/queue/messages', (frame) => {
            const msg: Message = JSON.parse(frame.body);
            addMessage(msg);
        }));

        // ACK — сервер подтвердил наше исходящее
        s.push(client.subscribe('/user/queue/message-ack', (frame) => {
            const ack: MessageAckEvent = JSON.parse(frame.body);
            confirmMessage(ack);
        }));

        // Удаление
        s.push(client.subscribe('/user/queue/message-deleted', (frame) => {
            const evt: MessageDeletedEvent = JSON.parse(frame.body);
            deleteMessage(evt);
        }));

        // Read receipts
        s.push(client.subscribe('/user/queue/read-receipt', (frame) => {
            const evt: ReadReceiptEvent = JSON.parse(frame.body);
            markConvRead(evt.conversationId);
        }));

        // Typing
        s.push(client.subscribe('/user/queue/typing', (frame) => {
            const evt: TypingEvent = JSON.parse(frame.body);
            updateTyping(evt);
        }));

        // Presence (broadcast)
        s.push(client.subscribe('/topic/presence', (frame) => {
            const evt: PresenceEvent = JSON.parse(frame.body);
            updatePresence(evt);
        }));
    }, [addMessage, confirmMessage, deleteMessage, updatePresence, updateTyping, markConvRead]);

    useEffect(() => {
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5_000,

            onConnect: () => {
                console.log('[WS] Connected to Stomp');
                subscribe(client);

                // Presence heartbeat
                pingRef.current = setInterval(() => {
                    if (client.connected) {
                        client.publish({ destination: '/app/presence.ping' });
                    }
                }, PING_MS);
            },

            onDisconnect: () => {
                console.log('[WS] Disconnected');
                subRefs.current = [];
                if (pingRef.current) clearInterval(pingRef.current);
            },

            onStompError: (frame) => {
                console.error('[WS] STOMP error', frame.headers['message']);
                console.error('[WS] Details:', frame.body);
            },

            onWebSocketClose: () => {
                console.log('[WS] WebSocket closed');
            },

            onWebSocketError: (event) => {
                console.error('[WS] WebSocket error', event);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            subRefs.current.forEach((s) => s.unsubscribe());
            subRefs.current = [];
            if (pingRef.current) clearInterval(pingRef.current);
            if (reconnAtRef.current) clearTimeout(reconnAtRef.current);
            client.deactivate();
        };
    }, [token, subscribe]);

    /** Публичный API для компонентов */
    const sendMessage = useCallback(
        (targetUsername: string, content: string, clientTempId: string) => {
            clientRef.current?.publish({
                destination: '/app/message.send',
                body: JSON.stringify({ targetUsername, content, clientTempId }),
            });
        },
        []
    );

    const sendTypingStart = useCallback((conversationId: number) => {
        clientRef.current?.publish({
            destination: '/app/typing.start',
            body: JSON.stringify({ conversationId }),
        });
    }, []);

    const sendTypingStop = useCallback((conversationId: number) => {
        clientRef.current?.publish({
            destination: '/app/typing.stop',
            body: JSON.stringify({ conversationId }),
        });
    }, []);

    return { sendMessage, sendTypingStart, sendTypingStop };
}
