import { io } from "socket.io-client";
import { getAuthSession } from "./authStorage";

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const createChatSocket = () => {
  const session = getAuthSession();

  const socket = io(getSocketBaseUrl(), {
    transports: ["websocket"],
    auth: {
      token: session?.token ? `Bearer ${session.token}` : "",
    },
  });

  return socket;
};
