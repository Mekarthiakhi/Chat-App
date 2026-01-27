import User from "../models/User.js";

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await User.create({ username, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
