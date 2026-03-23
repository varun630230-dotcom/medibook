import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (userId, onNotification) => {
  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket connected');
      stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        onNotification(notification);
      });
    },
    onDisconnect: () => console.log('WebSocket disconnected'),
  });
  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
