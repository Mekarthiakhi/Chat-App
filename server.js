import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:5173`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Firebase Admin Setup ──────────────────────────────────────────────────────
try {
  const serviceAccount = JSON.parse(
    readFileSync(new URL('./firebase-service-account.json', import.meta.url))
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (err) {
  console.warn('⚠️ Firebase Admin could not be initialized. Service account file missing?');
}

// ─── Email Setup (Brevo & Local Fallback) ─────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  console.log(`✉️ Preparing to send email to ${to}...`);
  if (process.env.BREVO_API_KEY) {
    console.log('🔑 BREVO_API_KEY detected! Using Brevo API...');
    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'Chat App', email: process.env.EMAIL_USER },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Email sent via Brevo! Message ID:', response.data.messageId);
    } catch (err) {
      console.error('❌ Brevo Email error:', err.response?.data || err.message);
    }
  } else {
    console.log('⚠️ No BREVO_API_KEY found. Falling back to Nodemailer...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    try {
      await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
      console.log('✅ Email sent locally via Nodemailer to:', to);
    } catch (err) {
      console.error('❌ Nodemailer error:', err);
    }
  }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── MongoDB Atlas Connection ──────────────────────────────────────────────────
const maskedURI = process.env.MONGODB_URI 
  ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') 
  : 'NOT FOUND';
console.log('📡 Attempting to connect to:', maskedURI);

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('👉 TIP: Double-check your MongoDB Atlas Username/Password. If your password has special characters like @, use %40 instead.');
    }
  });

// ─── Schemas ───────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  country: { type: String },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  fcmToken: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  magicToken: { type: String },
  magicTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = public room
  room: { type: String, default: 'general' },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'emoji', 'image'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, age, gender, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: existingUser.email === email ? 'Email already in use' : 'Username taken' });
    }

    // Password validation: min 5 chars, 1 upper, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{5,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 5 characters and contain both an uppercase letter and a special character.'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username, email, password: hash, age, gender, country, isVerified: true
    });

    // Generate token so they can log in immediately
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    // Send Welcome Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Chat App! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">Welcome to Chat App!</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your account has been created successfully. You can now log in and start chatting!</p>
          <p><strong>Your Login Details:</strong><br/>
          Username: <code>${username}</code><br/>
          Email: <code>${email}</code></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Happy chatting! 💬</p>
        </div>
      `
    };

    await sendEmail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Registration successful!', 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        gender: user.gender, 
        country: user.country, 
        age: user.age, 
        bio: user.bio 
      } 
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Helper for random password generation
function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let pass = "";
  // Ensure at least one upper, one lower, one number
  pass += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  pass += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  pass += "0123456789"[Math.floor(Math.random() * 10)];
  for (let i = 0; i < 5; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

app.get('/api/verify-email/:token', async (req, res) => {
  try {
    console.log(`🔗 Verification link hit with token: ${req.params.token}`);
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send('<h1>Invalid or expired token</h1>');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    const frontendUrl = FRONTEND_URL;
    const frontendUser = JSON.stringify({ id: user._id, username: user.username });

    res.send(`
      <script>
        localStorage.setItem('chat_token', '${token}');
        localStorage.setItem('chat_user', '${frontendUser}');
        window.location.href = '${frontendUrl}';
      </script>
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1>Email verified!</h1>
        <p>Logging you in instantly...</p>
      </div>
    `);
  } catch (e) {
    res.status(500).send('Error verifying email');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email: username }] });

    // Security: Use same error for both non-existent user and wrong password
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    await User.findByIdAndUpdate(user._id, { isOnline: true });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful', token, user: { id: user._id, username: user.username, gender: user.gender, country: user.country, age: user.age, bio: user.bio } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`📩 Password reset requested for: ${email}`);
    const user = await User.findOne({ email });

    // Security: Don't tell the user if the email exists or not
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const newTempPassword = generateRandomPassword();
    user.password = await bcrypt.hash(newTempPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your New Password - Chat App',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">Password Reset Successful</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>We have generated a new secure password for your account:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-family: monospace; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; color: #1f2937; letter-spacing: 2px;">
            ${newTempPassword}
          </div>
          <p><strong>Login Details:</strong><br/>
          Username: <code>${user.username}</code><br/>
          Email: <code>${user.email}</code></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Please log in and change your password in your settings for better security.</p>
        </div>
      `
    };

    await sendEmail(mailOptions);
    res.json({ success: true, message: 'password has been sent to your email.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const magicToken = crypto.randomBytes(32).toString('hex');
    user.magicToken = magicToken;
    user.magicTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const magicUrl = `${BACKEND_URL}/api/auth/verify-magic/${magicToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login to Chat App',
      html: `<h2>Login Link</h2><p>Click below to log in instantly (valid for 15 mins):</p><a href="${magicUrl}">${magicUrl}</a>`
    };

    await sendEmail(mailOptions);
    res.json({ success: true, message: 'Login link sent to your email!' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/auth/verify-magic/:token', async (req, res) => {
  try {
    console.log(`🪄 Magic link hit with token: ${req.params.token}`);
    const user = await User.findOne({
      magicToken: req.params.token,
      magicTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).send('<h1>Link invalid or expired</h1>');

    user.magicToken = undefined;
    user.magicTokenExpires = undefined;
    user.isVerified = true; // Magic link also verifies the email
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    const frontendUrl = FRONTEND_URL;
    const frontendUser = JSON.stringify({ id: user._id, username: user.username });
    res.send(`
      <script>
        localStorage.setItem('chat_token', '${token}');
        localStorage.setItem('chat_user', '${frontendUser}');
        window.location.href = '${frontendUrl}';
      </script>
      <h1>Logging you in...</h1>
    `);
  } catch (e) { res.status(500).send('Error during magic login'); }
});

app.get('/api/users/online', auth, async (req, res) => {
  const users = await User.find({ isOnline: true, _id: { $ne: req.user.id } })
    .select('username age gender country avatar isOnline lastSeen')
    .limit(50);
  res.json(users);
});

app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('username age gender country avatar isOnline lastSeen');
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
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

app.post('/api/users/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Serve Frontend in Production ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/^.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const onlineUsers = new Map();

// Helper to send FCM notification
async function sendNotification(userId, title, body) {
  try {
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      const message = {
        notification: { title, body },
        token: user.fcmToken,
      };
      await admin.messaging().send(message);
      console.log('🚀 Notification sent to:', user.username);
    }
  } catch (err) {
    console.error('❌ FCM Error:', err);
  }
}

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('user_join', async ({ userId, username }) => {
    onlineUsers.set(userId, { socketId: socket.id, username });
    socket.userId = userId;
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(userId, { isOnline: true }).catch(e => console.error("Presence Error:", e));
    }
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

      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('new_private_message', { ...payload, from: senderId });
      } else {
        // User is offline, send push notification
        sendNotification(receiverId, `New message from ${senderName}`, content);
      }

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
      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() }).catch(e => console.error("Offline Error:", e));
      }
      io.emit('user_offline', { userId: socket.userId, onlineCount: onlineUsers.size });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Verification entry point: ${BACKEND_URL}`);
});
