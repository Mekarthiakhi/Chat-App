<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# 💝 HeartChat – Dating Chat App

A full-stack real-time dating chat application built with React, Node.js, Socket.io, and MongoDB Atlas.

---

## 🗂️ Project Structure

```
dating-chat-app/
├── src/                    # React frontend
│   ├── App.jsx             # Main app (all components)
│   └── index.js            # Entry point
├── public/index.html       # HTML template
├── server.js               # Node.js + Socket.io backend
├── package.json            # Frontend dependencies
├── package-backend.json    # Backend dependencies
├── .env.example            # Environment variables template
└── README.md
```

---

## 🚀 Setup Instructions

### 1. MongoDB Atlas Setup
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Create a database user (Database Access)
4. Allow network access from anywhere (Network Access → 0.0.0.0/0)
5. Get your connection string (Connect → Connect your application)

### 2. Backend Setup
```bash
# Copy package-backend.json as package.json in a /server folder, or run:
npm install express socket.io mongoose cors bcryptjs jsonwebtoken dotenv nodemon

# Create .env file (copy from .env.example):
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret

# Start backend:
node server.js
# OR with auto-reload:
npx nodemon server.js
```

### 3. Frontend Setup
```bash
npm install
npm start
```

---

## ✨ Features

### Auth
- 🔐 Register with username, email, password, age, gender, country
- 🔑 Login with username or email
- 🔒 JWT-based authentication
- 🍪 Session persistence (localStorage)

### Chat Modes
- 💬 **Public Rooms** – General Chat, Flirt Corner, Make Friends, Random
- 💌 **Private 1-on-1 Chat** – Direct messaging with any user
- 🤖 **AI Chat** – AI-powered dating features (matchmaker, tips)

### Users
- 👥 Online users list with gender filter (All / Male / Female)
- 🔍 Search users by username
- 🌍 Country flags and location display
- 🟢 Online/offline status indicators

### Real-time
- ⚡ Socket.io for instant messaging
- ✍️ Live typing indicators
- 🟢 Online presence tracking

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | ❌ | Register new user |
| POST | /api/login | ❌ | Login user |
| GET | /api/users/online | ✅ | Get online users |
| GET | /api/messages/public | ✅ | Get public messages |
| GET | /api/messages/private/:userId | ✅ | Get private messages |

---

## 🔌 Socket Events

| Event (emit) | Payload | Description |
|--------------|---------|-------------|
| user_join | { userId, username } | Register presence |
| join_room | roomName | Join a chat room |
| public_message | { senderId, content, ... } | Send public message |
| private_message | { senderId, receiverId, content } | Send private message |
| typing | { room/receiverId, username } | Typing indicator |

---

## 🎨 Tech Stack

- **Frontend**: React 18, CSS Variables, Google Fonts (Playfair Display + DM Sans)
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcrypt
- **Real-time**: WebSockets via Socket.io

---

## 🔧 Environment Variables (.env)

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.mongodb.net/datingchat
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

---

## 📦 Production Deployment

### Backend → Railway / Render / Fly.io
- Set environment variables in dashboard
- Deploy from GitHub

### Frontend → Vercel / Netlify
- Set `REACT_APP_API_URL` to your backend URL
- Deploy from GitHub

---

Made with ❤️ – HeartChat
>>>>>>> 9fad5fd (local changes)
