import Message from "../models/Message.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ error: "Sender and text required" });
    }

    const message = await Message.create({ sender, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL MESSAGES
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
