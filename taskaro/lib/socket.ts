import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.io client instance
 */
export const getSocket = (): Socket => {
  if (typeof window === "undefined") {
    return null as any;
  }

  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to WebSocket server:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection issue:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
    });
  }

  return socket;
};
