import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class SocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    connect(meetingId, onConnected, onError) {
        const socket = new SockJS('http://localhost:8080/ws');

        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('WebSocket connected');
            this.connected = true;
            if (onConnected) onConnected();
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            if (onError) onError(frame);
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
            this.connected = false;
        }
    }

    // Subscribe to meeting-specific topics
    subscribeTo(destination, callback) {
        if (!this.client || !this.connected) {
            console.error('Not connected to WebSocket');
            return null;
        }

        const subscription = this.client.subscribe(destination, (message) => {
            const data = JSON.parse(message.body);
            callback(data);
        });

        this.subscriptions.set(destination, subscription);
        return subscription;
    }

    // Send signaling messages
    sendSignal(meetingId, type, data) {
        if (!this.client || !this.connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        const destination = `/app/meeting/${meetingId}/${type}`;
        this.client.publish({
            destination,
            body: JSON.stringify(data),
        });
    }

    // Send offer
    sendOffer(meetingId, offer, targetUserId) {
        this.sendSignal(meetingId, 'offer', {
            offer,
            targetUserId,
            timestamp: Date.now(),
        });
    }

    // Send answer
    sendAnswer(meetingId, answer, targetUserId) {
        this.sendSignal(meetingId, 'answer', {
            answer,
            targetUserId,
            timestamp: Date.now(),
        });
    }

    // Send ICE candidate
    sendIceCandidate(meetingId, candidate, targetUserId) {
        this.sendSignal(meetingId, 'ice-candidate', {
            candidate,
            targetUserId,
            timestamp: Date.now(),
        });
    }

    // Broadcast join
    broadcastJoin(meetingId, userId, userName) {
        this.sendSignal(meetingId, 'join', {
            userId,
            userName,
            timestamp: Date.now(),
        });
    }

    // Broadcast leave
    broadcastLeave(meetingId, userId) {
        this.sendSignal(meetingId, 'leave', {
            userId,
            timestamp: Date.now(),
        });
    }

    // Send chat message
    sendChatMessage(meetingId, message, userName) {
        this.sendSignal(meetingId, 'chat', {
            message,
            userName,
            timestamp: Date.now(),
        });
    }
}

export default new SocketService();
