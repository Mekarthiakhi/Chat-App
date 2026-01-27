// Imports
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/Message.js";


dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for development
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
      const { sender, text } = data;

      if (!sender || !text) return;

      // 1️⃣ Save message to MongoDB
      const message = await Message.create({
        sender,
        text,
      });

      // 2️⃣ Populate sender details
      const populatedMessage = await message.populate(
        "sender",
        "username email"
      );

      // 3️⃣ Broadcast saved message
      io.emit("receiveMessage", populatedMessage);

    } catch (err) {
      console.error("❌ Socket message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
