import express from "express";
import {
  sendMessage,
  getMessages
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/send", authMiddleware, sendMessage);
router.get("/", authMiddleware, getMessages);

export default router;
