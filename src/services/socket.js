// src/services/socket.js
import { io } from "socket.io-client";
import { ApiWebURL } from "../utils/index.jsx";

const configuredUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || ApiWebURL;
const socketUrl = configuredUrl.replace(/\/api\/?$/, '');

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
