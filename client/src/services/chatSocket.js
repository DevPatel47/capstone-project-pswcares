import { io } from "socket.io-client";
import { getAuthToken } from "./authStorage";

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const createChatSocket = () => {
  const token = getAuthToken();

  const socket = io(getSocketBaseUrl(), {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 800,
    timeout: 15000,
    auth: {
      token: token ? `Bearer ${token}` : "",
    },
  });

  return socket;
};
