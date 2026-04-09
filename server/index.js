const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");

const connectDb = require("./config/db");
const startNotificationCron = require("./cron/notification.cron.js");
const startAlarmCron = require("./cron/alarm.cron.js");

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Notification server running" });
});

const startServer = async () => {
  await connectDb();

  // 🚀 Start cron AFTER DB connection
  startNotificationCron();
  startAlarmCron();

  const server = http.createServer(app);
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await require("mongoose").connection.close();
  process.exit(0);
});

startServer();
