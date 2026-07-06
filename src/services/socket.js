// src/services/socket.js
import { io } from "socket.io-client";
import { ApiWebURL } from "../utils/index.jsx";

export const socket = io(ApiWebURL, {
  autoConnect: true,
});