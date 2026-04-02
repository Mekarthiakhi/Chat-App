const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// ─── MongoDB Atlas Connection ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://<user>:<pass>@cluster0.mongodb.net/datingchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── Schemas ───────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age:      { type: Number },
  gender:   { type: String, enum: ['Male','Female','Other'] },
  country:  { type: String },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt:{ type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = public room
  room:      { type: String, default: 'general' },
  content:   { type: String, required: true },
  type:      { type: String, enum: ['text','emoji','image'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

const User    = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, age, gender, country } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash, age, gender, country });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, gender: user.gender, country: user.country, age: user.age } });
  } catch (e) {
    res.status(400).json({ error: e.message.includes('duplicate') ? 'Username or email already exists' : e.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ error: 'Invalid credentials' });
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, gender: user.gender, country: user.country, age: user.age, bio: user.bio } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/online', auth, async (req, res) => {
  const users = await User.find({ isOnline: true, _id: { $ne: req.user.id } })
    .select('username age gender country avatar isOnline lastSeen')
    .limit(50);
  res.json(users);
});

app.get('/api/messages/public', auth, async (req, res) => {
  const messages = await Message.find({ room: 'general', receiver: null })
    .populate('sender', 'username gender country')
    .sort({ createdAt: -1 }).limit(50);
  res.json(messages.reverse());
});

app.get('/api/messages/private/:userId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id }
    ]
  }).populate('sender', 'username gender').sort({ createdAt: 1 }).limit(100);
  res.json(messages);
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('user_join', async ({ userId, username }) => {
    onlineUsers.set(userId, { socketId: socket.id, username });
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('user_online', { userId, username, onlineCount: onlineUsers.size });
  });

  socket.on('join_room', (room) => socket.join(room));

  socket.on('public_message', async ({ senderId, content, senderName, gender, country }) => {
    try {
      const msg = await Message.create({ sender: senderId, content, room: 'general' });
      io.to('general').emit('new_public_message', {
        _id: msg._id, content, createdAt: msg.createdAt,
        sender: { _id: senderId, username: senderName, gender, country }
      });
    } catch (e) { console.error(e); }
  });

  socket.on('private_message', async ({ senderId, receiverId, content, senderName }) => {
    try {
      const msg = await Message.create({ sender: senderId, receiver: receiverId, content });
      const receiverSocket = onlineUsers.get(receiverId);
      const payload = { _id: msg._id, content, createdAt: msg.createdAt, sender: { _id: senderId, username: senderName } };
      if (receiverSocket) io.to(receiverSocket.socketId).emit('new_private_message', { ...payload, from: senderId });
      socket.emit('new_private_message', { ...payload, to: receiverId });
    } catch (e) { console.error(e); }
  });

  socket.on('typing', ({ room, username, receiverId }) => {
    if (receiverId) {
      const rec = onlineUsers.get(receiverId);
      if (rec) io.to(rec.socketId).emit('user_typing', { username });
    } else {
      socket.to(room).emit('user_typing', { username });
    }
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId: socket.userId, onlineCount: onlineUsers.size });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
