import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketClient {
    private client: Client;
    private onConnectCallbacks: (() => void)[] = [];

    constructor(token: string) {
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.onConnectCallbacks.forEach(cb => cb());
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            }
        });
    }

    public connect() {
        if (!this.client.active) {
            this.client.activate();
        }
    }

    public disconnect() {
        if (this.client.active) {
            this.client.deactivate();
        }
    }

    public onConnect(callback: () => void) {
        this.onConnectCallbacks.push(callback);
        if (this.client.active) {
            callback();
        }
    }

    public subscribe(destination: string, callback: (message: any) => void) {
        return this.client.subscribe(destination, (msg) => {
            if (msg.body) {
                callback(JSON.parse(msg.body));
            }
        });
    }
}

// Singleton instance management
let wsInstance: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    if (!wsInstance) {
        wsInstance = new WebSocketClient(token);
        wsInstance.connect();
    }
    return wsInstance;
};

export const disconnectWebSocket = () => {
    if (wsInstance) {
        wsInstance.disconnect();
        wsInstance = null;
    }
};
