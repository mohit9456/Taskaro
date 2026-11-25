const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const path = require("path");

const connectDb = require("./config/db");
const startNotificationCron = require("./cron/notification.cron.js");
const startAlarmCron = require("./cron/alarm.cron.js");
const { initSocketServer, getIO, getChannelRoom } = require("./services/socket.service.js");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Taskaro Notification & Socket Server running" });
});

// Broadcast endpoint for REST API integration
app.post("/api/broadcast-message", (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message payload" });
    }

    const io = getIO();
    if (io) {
      const room = getChannelRoom({
        channelType: message.channelType,
        departmentId: message.departmentId?._id || message.departmentId,
        ticketId: message.ticketId?._id || message.ticketId,
        recipientId: message.recipientId?._id || message.recipientId,
        userId: message.senderId?._id || message.senderId,
      });

      if (room) {
        io.to(room).emit("new_message", message);
      }

      // If direct message, also deliver to recipient personal room
      if (message.channelType === "direct" && message.recipientId) {
        const recipientId = message.recipientId._id || message.recipientId;
        io.to(`user_${recipientId}`).emit("new_message", message);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Broadcast error:", err);
    return res.status(500).json({ error: err.message || "Failed to broadcast message" });
  }
});

const startServer = async () => {
  await connectDb();

  // 🚀 Start cron AFTER DB connection
  startNotificationCron();
  startAlarmCron();

  const server = http.createServer(app);

  // ⚡ Initialize Socket.io on HTTP Server
  initSocketServer(server);

  const PORT = process.env.PORT || 4000;

  server.listen(PORT, () => {
    console.log(`🚀 Server and WebSocket running on port ${PORT}`);
  });
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await require("mongoose").connection.close();
  process.exit(0);
});

startServer();
