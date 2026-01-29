// 1️⃣ Imports
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import Message from "./models/Message.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// 2️⃣ Create Express app
const app = express();

// 3️⃣ Middleware
app.use(cors());
app.use(express.json());

// 4️⃣ REST routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 5️⃣ Create HTTP server
const server = http.createServer(app);

// 6️⃣ Create Socket.IO instance  ✅ io is defined HERE
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 7️⃣ Socket.IO JWT middleware  ✅ NOW io exists
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// 8️⃣ Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.userId);

  socket.on("sendMessage", async ({ text }) => {
    try {
      if (!text) return;

      const message = await Message.create({
        sender: socket.userId,
        text,
      });

      const populatedMessage = await message.populate(
        "sender",
        "username email"
      );

      io.emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("❌ Socket error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.userId);
  });
});

// 9️⃣ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// 🔟 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
