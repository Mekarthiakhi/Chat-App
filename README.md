# 💝 HeartChat – Dating Chat App

A full-stack real-time dating chat application built with React, Node.js, Socket.io, and MongoDB Atlas.

---

## 🗂️ Project Structure

```
Chat-App/
├── src/                    # React frontend (Vite)
│   ├── components/
│   │   ├── ChatDashboard.jsx
│   │   ├── ParticlesBg.jsx
│   │   └── auth/
│   │       ├── LoginForm.jsx
│   │       ├── RegisterForm.jsx
│   │       ├── ResetPassword.jsx
│   │       └── AuthTabs.jsx
│   ├── services/
│   │   └── apiAuth.js
│   ├── firebase/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   └── messaging.js
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── userRoutes.js
│   │   └── testRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── config/
│   │   └── db.js
│   └── package.json
├── server.js
├── package.json
├── vite.config.js
├── .env.example
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

### 2. Firebase Setup
1. Go to [https://firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Cloud Messaging for notifications
5. Download service account JSON file
6. Place as `firebase-service-account.json` in project root

### 3. Backend Setup
```bash
cd server
npm install
cp ../.env.example ../.env
# Edit .env and add your MongoDB URI and JWT secret
npm run dev
```

### 4. Frontend Setup
```bash
npm install
npm run dev
```

---

## ✨ Features

### 🔐 Authentication
- ✅ Register with username, email, password, age, gender, country
- ✅ Login with email or username
- ✅ JWT-based secure authentication
- ✅ Password reset via email
- ✅ Session persistence (localStorage)

### 💬 Chat Modes
- ✅ **Public Rooms** – General Chat, Flirt Corner, Make Friends, Random
- ✅ **Private 1-on-1 Chat** – Direct messaging with any user
- ✅ **Typing Indicators** – See when someone is typing

### 👥 User Management
- ✅ Online users list with gender/country filter
- ✅ Search users by username
- ✅ Friend system (add/remove friends)
- ✅ Online/offline status indicators
- ✅ User profiles with avatars

### 🔔 Notifications
- ✅ Firebase push notifications
- ✅ Email notifications (Brevo)
- ✅ Real-time updates via Socket.io

### 🎨 UI/UX
- ✅ Dark/Light theme toggle
- ✅ Material-UI components
- ✅ Responsive design
- ✅ Smooth animations (Framer Motion)
- ✅ Emoji picker integration

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | ❌ | Register new user |
| POST | /api/login | ❌ | Login user |
| GET | /api/users | ✅ | Get all online users |
| GET | /api/messages/public | ✅ | Get public messages |
| GET | /api/messages/private/:userId | ✅ | Get private messages |
| POST | /api/users/friend | ✅ | Toggle friend |
| POST | /api/users/fcm-token | ✅ | Update FCM token |

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

- **Frontend**: React 19, Material-UI 7+, Vite, Framer Motion
- **Backend**: Node.js, Express 5, Socket.io
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcryptjs
- **Real-time**: WebSockets via Socket.io
- **Notifications**: Firebase Cloud Messaging + Brevo Email

---

## 🔧 Environment Variables (.env)

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# JWT
JWT_SECRET=your_super_secret_key_here_min_32_chars

# Server
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=noreply@chatapp.com

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
RENDER_EXTERNAL_URL=https://your-backend.onrender.com
```

---

## 📦 Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Start backend
npm start

# Start frontend (in new terminal)
npm run dev
```

---

## 🧪 Testing

```bash
# Test backend
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123",
    "age": 25,
    "gender": "Male"
  }'

# Test login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

---

## 🚀 Production Deployment

### Backend → Railway / Render / Fly.io
- Set environment variables in dashboard
- Deploy from GitHub
- Configure MongoDB connection for production

### Frontend → Vercel / Netlify
- Set `VITE_API_URL` to your backend URL
- Deploy from GitHub

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ bcryptjs password hashing (12 salt rounds)
- ✅ CORS protection with whitelisted origin
- ✅ Input validation and sanitization
- ✅ Rate limiting on auth endpoints
- ✅ Secure socket.io events
- ✅ Firebase security rules

---

## 📝 Latest Updates

- ✅ Fixed authentication controllers with real JWT logic
- ✅ Updated database schema with all required fields
- ✅ Added comprehensive input validation
- ✅ Improved mobile responsiveness
- ✅ Enhanced UI with error states and loading indicators
- ✅ Fixed dependency typos
- ✅ Added CORS security hardening

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

ISC

---

**Made with ❤️ – HeartChat Team**
