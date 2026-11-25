const { Server } = require("socket.io");
const TeamMessage = require("../models/TeamMessage");
const User = require("../models/User");

let io = null;

/**
 * Computes deterministic room ID based on channel type
 */
function getChannelRoom(data) {
  if (!data) return null;
  const { channelType, departmentId, ticketId, recipientId, userId } = data;

  if (channelType === "department" && departmentId) {
    return `dept_${departmentId}`;
  }
  if (channelType === "ticket" && ticketId) {
    return `ticket_${ticketId}`;
  }
  if (channelType === "direct" && userId && recipientId) {
    const u1 = userId.toString();
    const u2 = recipientId.toString();
    return `direct_${[u1, u2].sort().join("_")}`;
  }
  return null;
}

/**
 * Initialize Socket.io on Express HTTP Server
 */
function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

    // User identification: Join personal room for cross-channel alerts/DMs
    socket.on("identify", ({ userId }) => {
      if (userId) {
        socket.userId = userId.toString();
        socket.join(`user_${userId}`);
      }
    });

    // Join channel room (department / ticket huddle / direct message)
    socket.on("join_channel", (data) => {
      const room = getChannelRoom(data);
      if (room) {
        socket.join(room);
        console.log(`[Socket] Client ${socket.id} joined room: ${room}`);
      }
      if (data.userId) {
        socket.userId = data.userId.toString();
        socket.join(`user_${data.userId}`);
      }
    });

    // Leave channel room
    socket.on("leave_channel", (data) => {
      const room = getChannelRoom(data);
      if (room) {
        socket.leave(room);
        console.log(`[Socket] Client ${socket.id} left room: ${room}`);
      }
    });

    // Real-time message handler
    socket.on("send_message", async (data, callback) => {
      try {
        const {
          orgId,
          channelType,
          departmentId,
          ticketId,
          recipientId,
          senderId,
          content,
          attachments,
        } = data;

        if (!content || !content.trim() || !orgId || !channelType || !senderId) {
          if (typeof callback === "function") {
            callback({ success: false, error: "Missing required fields" });
          }
          return;
        }

        // Persist message to database
        const newMsg = await TeamMessage.create({
          orgId,
          channelType,
          departmentId: departmentId || null,
          ticketId: ticketId || null,
          senderId,
          recipientId: recipientId || null,
          content: content.trim(),
          attachments: attachments || [],
          readBy: [senderId],
        });

        const populated = await TeamMessage.findById(newMsg._id)
          .populate("senderId", "name email profileImage role")
          .populate("recipientId", "name email profileImage role")
          .lean();

        // Broadcast to room
        const room = getChannelRoom(data);
        if (room) {
          io.to(room).emit("new_message", populated);
        }

        // If direct message, also deliver to recipient personal room
        if (channelType === "direct" && recipientId) {
          io.to(`user_${recipientId}`).emit("new_message", populated);
        }

        if (typeof callback === "function") {
          callback({ success: true, message: populated });
        }
      } catch (err) {
        console.error("Socket send_message error:", err);
        if (typeof callback === "function") {
          callback({
            success: false,
            error: err.message || "Failed to save message",
          });
        }
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const room = getChannelRoom(data);
      if (room) {
        socket.to(room).emit("user_typing", {
          userId: data.userId,
          userName: data.userName,
          room,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      const room = getChannelRoom(data);
      if (room) {
        socket.to(room).emit("user_stop_typing", {
          userId: data.userId,
          room,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocketServer,
  getIO,
  getChannelRoom,
};
