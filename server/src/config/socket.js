import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import User from "../models/user.model.js";
import { createChatMessage } from "../services/chat.service.js";

const connectedUsers = new Map();

const addUserSocket = (userId, socketId) => {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }

  connectedUsers.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    connectedUsers.delete(userId);
  }
};

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, "");
  }

  const headerToken = socket.handshake.headers?.authorization;

  if (!headerToken) {
    return "";
  }

  return String(headerToken).replace(/^Bearer\s+/i, "");
};

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = String(origin).replace(/\/$/, "");
  return env.allowedOrigins.includes(normalizedOrigin);
};

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);

      if (!token) {
        next(new Error("Unauthorized: missing token."));
        return;
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.sub);

      if (!user || user.status !== "active") {
        next(new Error("Unauthorized: invalid user."));
        return;
      }

      socket.data.user = {
        id: String(user._id),
        role: user.role,
        name: user.name,
      };

      next();
    } catch (_error) {
      next(new Error("Unauthorized: invalid token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    addUserSocket(userId, socket.id);

    console.log(`Socket connected: ${socket.id}`);

    socket.on("send_message", async (payload, ack) => {
      try {
        const { appointmentId, content } = payload || {};

        const result = await createChatMessage({
          appointmentId,
          senderId: userId,
          content,
        });

        const outgoing = {
          _id: result.message._id,
          appointmentId: String(result.message.appointmentId),
          senderId: String(result.message.senderId),
          receiverId: String(result.message.receiverId),
          content: result.message.content,
          createdAt: result.message.createdAt,
        };

        socket.emit("receive_message", outgoing);

        const recipientSockets =
          connectedUsers.get(result.receiverId) || new Set();

        for (const recipientSocketId of recipientSockets) {
          io.to(recipientSocketId).emit("receive_message", outgoing);
        }

        if (typeof ack === "function") {
          ack({ ok: true, message: outgoing });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message || "Unable to send message." });
        }
      }
    });

    socket.on("disconnect", () => {
      removeUserSocket(userId, socket.id);
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
