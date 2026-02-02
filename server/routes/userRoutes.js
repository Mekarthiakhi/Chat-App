import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* Get all users except self */
router.get("/", authMiddleware, async (req, res) => {
  const users = await User.find(
    { _id: { $ne: req.userId } },
    "name email"
  );

  res.json(users);
});

export default router;
