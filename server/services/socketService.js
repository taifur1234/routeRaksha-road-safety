import { verifyToken } from "../utils/token.js";

let ioInstance = null;
const userSockets = new Map();

function readCookie(cookieHeader, name) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function rememberSocket(userId, socketId) {
  const key = String(userId);
  const sockets = userSockets.get(key) || new Set();
  sockets.add(socketId);
  userSockets.set(key, sockets);
}

function forgetSocket(userId, socketId) {
  const key = String(userId);
  const sockets = userSockets.get(key);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (!sockets.size) {
    userSockets.delete(key);
  }
}

async function initializeSocketServer(httpServer) {
  try {
    const { Server } = await import("socket.io");
    ioInstance = new Server(httpServer, {
      cors: {
        origin: String(process.env.CORS_ORIGINS || "http://localhost:5173")
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
        credentials: true,
      },
    });

    ioInstance.use((socket, next) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        readCookie(socket.handshake.headers?.cookie, "routeRakshaToken");
      const payload = verifyToken(token);

      if (!payload?.id) {
        return next(new Error("Unauthorized"));
      }

      socket.userId = String(payload.id);
      return next();
    });

    ioInstance.on("connection", (socket) => {
      rememberSocket(socket.userId, socket.id);
      socket.join(`user:${socket.userId}`);

      socket.on("disconnect", () => {
        forgetSocket(socket.userId, socket.id);
      });
    });

    console.log("Socket.io notifications enabled");
  } catch (error) {
    ioInstance = null;
    console.warn(`Socket.io not enabled: ${error.message}`);
  }
}

function emitToUser(userId, eventName, payload) {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(`user:${String(userId)}`).emit(eventName, payload);
}

export { emitToUser, initializeSocketServer };
