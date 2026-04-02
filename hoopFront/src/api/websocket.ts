import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type MessageCallback = (msg: any) => void;

class WebSocketService {
    private client: Client | null = null;
    private subscriptions = new Map<string, StompSubscription>();
    private pendingSubscriptions: Array<{ dest: string; cb: MessageCallback }> = [];

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                resolve();
                return;
            }

            this.client = new Client({
                webSocketFactory: () => new SockJS('/ws') as WebSocket,
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    // Process pending subscriptions
                    this.pendingSubscriptions.forEach(({ dest, cb }) => this.doSubscribe(dest, cb));
                    this.pendingSubscriptions = [];
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('STOMP error', frame.body);
                    reject(new Error(frame.body));
                },
            });
            this.client.activate();
        });
    }

    subscribe(destination: string, callback: MessageCallback): void {
        if (this.client?.connected) {
            this.doSubscribe(destination, callback);
        } else {
            // Delay until connected to fix race conditions
            this.pendingSubscriptions.push({ dest: destination, cb: callback });
        }
    }

    private doSubscribe(destination: string, callback: MessageCallback): void {
        if (this.subscriptions.has(destination)) return; // Avoid duplicate subs
        const sub = this.client!.subscribe(destination, (msg) => {
            if (msg.body) {
                callback(JSON.parse(msg.body));
            }
        });
        this.subscriptions.set(destination, sub);
    }

    unsubscribe(destination: string): void {
        this.subscriptions.get(destination)?.unsubscribe();
        this.subscriptions.delete(destination);
    }

    publish(destination: string, body: any): void {
        if (this.client?.connected) {
            this.client.publish({
                destination,
                body: JSON.stringify(body)
            });
        }
    }

    disconnect(): void {
        this.client?.deactivate();
        this.client = null;
        this.subscriptions.clear();
        this.pendingSubscriptions = [];
    }

    get isConnected(): boolean {
        return this.client?.connected ?? false;
    }
}

// Singleton
export const wsService = new WebSocketService();

export const initWebSocket = async (): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    if (!token || wsService.isConnected) return;
    await wsService.connect(token);
};
