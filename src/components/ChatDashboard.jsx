import {
  Box,
  Typography,
  Avatar,
  Badge,
  InputBase,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import io from "socket.io-client";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import PeopleIcon from "@mui/icons-material/People";
import EmojiPicker from "emoji-picker-react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useThemeMode } from "../App";
import { requestNotificationPermission, onForegroundMessage } from "../firebase/messaging";
import { getUsers, updateFcmToken, API_URL } from "../services/apiAuth";

/* ─── helpers ─────────────────────────────────────────── */

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

function timeLabel(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* avatar color based on gender */
function avatarColor(name = "", gender = "") {
  if (gender === "Male") return "#3b82f6";
  if (gender === "Female") return "#ec4899";
  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

/* ─── component ────────────────────────────────────────── */

export default function ChatDashboard({ onLogout }) {
  const authCtx = useAuth();
  const me = authCtx?.user;
  const { mode, toggle: toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Color palette based on theme
  const c = {
    bg: isDark ? "#0b0f1a" : "#f0f2f5",
    sidebar: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    sidebarHeader: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#e2e8f0" : "#1e293b",
    textSoft: isDark ? "#64748b" : "#64748b",
    textMuted: isDark ? "#475569" : "#94a3b8",
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    inputBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
    msgBubbleMe: "linear-gradient(135deg, #6366f1, #9333ea)",
    msgBubbleOther: isDark ? "rgba(255,255,255,0.09)" : "rgba(99,102,241,0.08)",
    msgBubbleOtherText: isDark ? "#e2e8f0" : "#1e293b",
    chatBg: isDark ? "#0b0f1a" : "#e8ecf1",
    chatGlow: isDark ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.02)",
    hoverBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    selectedBg: isDark
      ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(147,51,234,0.15))"
      : "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(147,51,234,0.08))",
    selectedBorder: isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)",
  };

  /* sidebar state */
  const [allUsers, setAllUsers] = useState([]);
  const [onlineMap, setOnlineMap] = useState({});
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [unread, setUnread] = useState({});          // uid → count

  /* chat state */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, text: "" });
  const [genderFilter, setGenderFilter] = useState("All"); // "All", "Male", "Female"
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef();
  const inputRef = useRef();
  const socketRef = useRef();
  const selectedUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  /* ── 1. request notification permission on mount ─ */
  useEffect(() => {
    // Request browser notification permission immediately
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("🔔 Notification permission:", perm);
      });
    }

    // Also request FCM token for push notifications
    requestNotificationPermission().then((token) => {
      if (token && me?.uid) {
        updateFcmToken(token).catch(err => console.error("FCM token storage error:", err));
      }
    }).catch(err => console.warn("Notification permission error:", err));

    const unsub = onForegroundMessage((payload) => {
      const sender = payload.notification?.title || "Someone";
      setSnackbar({ open: true, text: `${sender}: ${payload.notification?.body}` });
    });
    return () => unsub();
  }, [me?.uid]);

  /* ── 2. Socket.io initialization & presence ────────── */
  useEffect(() => {
    if (!me?.uid) return;

    // Connect to Node.js backend
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit("user_join", { userId: me.uid, username: me.name });

    socket.on("new_private_message", (msg) => {
      const currentSelected = selectedUserRef.current;
      // If the message is for the current selected chat, add it
      setMessages((prev) => {
        const isFromSelected = msg.sender._id === currentSelected?.uid || msg.to === currentSelected?.uid;
        if (isFromSelected) {
          // Check for duplicates
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, { ...msg, senderUid: msg.sender._id, ts: msg.createdAt }];
        }
        return prev;
      });

      // Determine if this message is from someone OTHER than the currently open chat
      const isFromOtherUser = msg.sender._id !== currentSelected?.uid;
      const isSentByMe = msg.to !== undefined; // Messages I sent have a 'to' field

      // Only notify for incoming messages (not my own sent messages echoed back)
      if (!isSentByMe) {
        if (isFromOtherUser) {
          setUnread((prev) => ({ ...prev, [msg.sender._id]: (prev[msg.sender._id] || 0) + 1 }));
          document.title = `\uD83D\uDCAC New message - Chat App`;

          // System notification ONLY when tab is hidden, snackbar when focused
          if (document.hidden && Notification.permission === "granted") {
            new Notification(`\uD83D\uDCAC ${msg.sender.username}`, {
              body: msg.content || "New message",
              icon: "/vite.svg",
              tag: `msg-${msg._id}`,
              renotify: true,
              silent: false,
            });
          } else {
            setSnackbar({ open: true, text: `\uD83D\uDCAC ${msg.sender.username}: ${msg.content || "New message"}` });
          }
        }
      }
    });

    socket.on("user_typing", ({ username }) => {
      setTypingUser(username);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
    });

    socket.on("user_online", ({ userId }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("user_offline", ({ userId }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.disconnect();
    };
  }, [me?.uid]);

  /* ── keep selectedUser ref in sync for socket handler ── */
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  /* ── 4. load all registered users from Firestore ───── */
  useEffect(() => {
    if (!me?.uid) return;
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const mappedUsers = users.map(u => ({ ...u, uid: u._id, name: u.username }));
        setAllUsers(mappedUsers);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Poll every 10s for new users
    return () => clearInterval(interval);
  }, [me?.uid]);

  /* ── 5. User doc sync removed (handled by MongoDB) ── */

  /* ── 6. Load initial private messages from API ─────── */
  useEffect(() => {
    if (!selectedUser || !me?.uid) return;

    // Clear unread for the selected user
    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[selectedUser.uid];
      const totalUnread = Object.values(updated).reduce((a, b) => a + b, 0);
      document.title = totalUnread > 0 ? `(${totalUnread}) Chat App` : "Chat App";
      return updated;
    });

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/private/${selectedUser.uid}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('chat_token')}` }
        });
        const data = await res.json();
        setMessages(data.map(m => ({ ...m, senderUid: m.sender._id, ts: m.createdAt })));
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [selectedUser?.uid, me?.uid]);

  /* ── 7. Track unread removed (handled by Socket.io listener) ── */

  /* ── 8. scroll to bottom ────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── 9. focus input ─────────────────────────────────── */
  useEffect(() => {
    if (selectedUser) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedUser]);

  /* ── send message ───────────────────────────────────── */
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedUser || !me?.uid || !socketRef.current) return;

    const text = input.trim();
    setInput("");
    setShowEmoji(false);

    socketRef.current.emit("private_message", {
      senderId: me.uid,
      receiverId: selectedUser.uid,
      content: text,
      senderName: me.name
    });

  }, [input, selectedUser, me]);

  /* ── logout ─────────────────────────────────────────── */
  const handleLogout = () => {
    onLogout();
  };

  /* ── filtered sidebar users ────────────────────────── */
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = (u.name || u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === "All" || u.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  /* ── voice-to-text ─────────────────────────────────── */
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSnackbar({ open: true, text: "Voice input not supported in this browser" });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      inputRef.current?.focus();
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  /* ── quick messages ─────────────────────────────────── */
  const quickMessages = ["Hey 👋", "How are you?", "What's up?", "Let's chat!", "Good morning ☀️", "😊"];

  /* ─── RENDER ──────────────────────────────────────────── */
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: c.bg,
        color: c.text,
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ══════════════ SIDEBAR ══════════════ */}
      <Box
        sx={{
          width: isMobile ? "100%" : 320,
          display: isMobile && selectedUser ? "none" : "flex",
          flexDirection: "column",
          borderRight: `1px solid ${c.border}`,
          background: c.sidebar,
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          transition: "background 0.3s ease",
        }}
      >
        {/* ─ sidebar header ─ */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${c.border}`,
            background: c.sidebarHeader,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: avatarColor(me?.name, me?.gender),
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {(me?.name || me?.email || "?")[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize={14} lineHeight={1.2} color={c.text}>
                {me?.name || me?.email}
              </Typography>
              <Typography fontSize={11} sx={{ color: "#4ade80" }}>
                ● Online
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: c.textSoft }}>
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small" sx={{ color: c.textSoft }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ─ search ─ */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.8,
              borderRadius: "12px",
              background: c.inputBg,
              border: `1px solid ${c.inputBorder}`,
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: c.textSoft }} />
            <InputBase
              fullWidth
              placeholder="Search or start new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: 13, color: c.text, "& input::placeholder": { color: c.textSoft } }}
            />
          </Box>
        </Box>

        {/* ─ online banner ─ */}
        <Box sx={{ px: 2, pb: 0.5 }}>
          <Typography fontSize={11} sx={{ color: c.textSoft, textTransform: "uppercase", letterSpacing: 1 }}>
            {Object.values(onlineMap).filter(Boolean).length} online
          </Typography>
        </Box>

        {/* ─ gender filter ─ */}
        <Box sx={{ px: 2, pb: 1, display: "flex", gap: 0.8 }}>
          {["All", "Male", "Female"].map((g) => (
            <Box
              key={g}
              onClick={() => setGenderFilter(g)}
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: "16px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                background: genderFilter === g
                  ? g === "Male" ? "rgba(59,130,246,0.25)" : g === "Female" ? "rgba(236,72,153,0.25)" : "rgba(99,102,241,0.25)"
                  : c.inputBg,
                border: genderFilter === g
                  ? g === "Male" ? "1px solid rgba(59,130,246,0.5)" : g === "Female" ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(99,102,241,0.5)"
                  : "1px solid transparent",
                color: genderFilter === g
                  ? g === "Male" ? "#60a5fa" : g === "Female" ? "#f472b6" : "#a5b4fc"
                  : c.textSoft,
                transition: "all 0.15s",
                "&:hover": { background: c.hoverBg },
              }}
            >
              {g === "Male" ? <><MaleIcon sx={{ fontSize: 16 }} /> Male</> : g === "Female" ? <><FemaleIcon sx={{ fontSize: 16 }} /> Female</> : <><PeopleIcon sx={{ fontSize: 14 }} /> All</>}
            </Box>
          ))}
        </Box>

        {/* ─ user list ─ */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
          {filteredUsers.length === 0 && (
            <Typography sx={{ color: c.textMuted, textAlign: "center", mt: 4, fontSize: 13 }}>
              No users found
            </Typography>
          )}
          {filteredUsers.map((user) => {
            const isOnline = !!onlineMap[user.uid];
            const isSelected = selectedUser?.uid === user.uid;
            const unreadCount = unread[user.uid] || 0;

            return (
              <Box
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: "14px",
                  mb: 0.5,
                  cursor: "pointer",
                  background: isSelected
                    ? c.selectedBg
                    : "transparent",
                  border: isSelected ? `1px solid ${c.selectedBorder}` : "1px solid transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    background: isSelected
                      ? c.selectedBg
                      : c.hoverBg,
                  },
                }}
              >
                <Badge
                  overlap="circular"
                  variant="dot"
                  invisible={!isOnline}
                  sx={{
                    "& .MuiBadge-dot": {
                      bgcolor: "#4ade80",
                      border: `2px solid ${c.bg}`,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: avatarColor(user.name || user.email, user.gender),
                      fontSize: 17,
                      fontWeight: 700,
                    }}
                  >
                    {(user.name || user.email || "?")[0].toUpperCase()}
                  </Avatar>
                </Badge>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography fontWeight={600} fontSize={14} noWrap>
                      {user.name || user.email}
                    </Typography>
                    {unreadCount > 0 && (
                      <Box
                        sx={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: "10px",
                          bgcolor: "#22c55e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#000",
                          px: 0.7,
                        }}
                      >
                        {unreadCount}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Typography fontSize={12} sx={{ color: isOnline ? "#4ade80" : c.textSoft }}>
                      {isOnline ? "Online" : "Offline"}
                    </Typography>
                    {user.gender && (
                      <Typography fontSize={11} fontWeight={700} component="span" sx={{ color: user.gender === "Male" ? (isDark ? "#60a5fa" : "#2563eb") : user.gender === "Female" ? (isDark ? "#f472b6" : "#db2777") : "#a78bfa", display: "flex", alignItems: "center" }}>
                        {user.gender === "Male" ? <MaleIcon sx={{ fontSize: 16 }} /> : user.gender === "Female" ? <FemaleIcon sx={{ fontSize: 16 }} /> : null}
                      </Typography>
                    )}
                    {user.age && (
                      <Typography fontSize={11} fontWeight={600} sx={{ color: c.textSoft }}>
                        {user.age}y
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ══════════════ CHAT AREA ══════════════ */}
      <Box
        sx={{
          flex: 1,
          display: isMobile && !selectedUser ? "none" : "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!selectedUser ? (
          /* ── empty state ── */
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: c.textMuted,
            }}
          >
            <Box 
              component={motion.div}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              sx={{ 
                fontSize: 80,
                filter: isDark ? "drop-shadow(0 0 20px rgba(99,102,241,0.4))" : "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
              }}
            >
              💖
            </Box>
            <Typography fontWeight={800} fontSize={24} sx={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Find Your Match
            </Typography>
            <Typography fontSize={14} sx={{ maxWidth: 280, textAlign: "center" }}>
              Select a conversation from the sidebar to start chatting and making connections.
            </Typography>
          </Box>
        ) : (
          <>
            {/* ─ chat header ─ */}
            <Box
              sx={{
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: `1px solid ${c.border}`,
                background: c.sidebar,
                backdropFilter: "blur(12px)",
                zIndex: 10,
              }}
            >
              {isMobile && (
                <IconButton
                  size="small"
                  onClick={() => setSelectedUser(null)}
                  sx={{ color: c.textSoft }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}

              <Badge
                overlap="circular"
                variant="dot"
                invisible={!onlineMap[selectedUser.uid]}
                sx={{
                  "& .MuiBadge-dot": {
                    bgcolor: "#4ade80",
                    border: `2px solid ${c.bg}`,
                    width: 10,
                    height: 10,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: avatarColor(selectedUser.name || selectedUser.email, selectedUser.gender),
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {(selectedUser.name || selectedUser.email || "?")[0].toUpperCase()}
                </Avatar>
              </Badge>

              <Box>
                <Typography fontWeight={700} fontSize={15}>
                  {selectedUser.name || selectedUser.email}
                </Typography>
                <Typography fontSize={12} sx={{ color: typingUser === (selectedUser.name || selectedUser.email) ? "#a855f7" : (onlineMap[selectedUser.uid] ? "#4ade80" : c.textSoft), fontStyle: typingUser === (selectedUser.name || selectedUser.email) ? "italic" : "normal" }}>
                  {typingUser === (selectedUser.name || selectedUser.email) ? "typing..." : (onlineMap[selectedUser.uid] ? "Online" : "Offline")}
                </Typography>
              </Box>
            </Box>

            {/* ─ messages ─ */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: { xs: 1.5, sm: 3 },
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                background:
                  `radial-gradient(ellipse at 20% 50%, ${c.chatGlow}, transparent 60%), ${c.chatBg}`,
              }}
            >
              {messages.length === 0 && (
                <Typography
                  sx={{ textAlign: "center", color: c.textSoft, fontSize: 13, mt: 8 }}
                >
                  No messages yet. Say hello! 👋
                </Typography>
              )}

              <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isMe = msg.senderUid === me?.uid;
                const showTime =
                  i === 0 ||
                  (msg.ts && messages[i - 1]?.ts &&
                    msg.ts.toDate?.().getDate?.() !==
                    messages[i - 1].ts.toDate?.().getDate?.());

                return (
                  <motion.div 
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {showTime && msg.ts && (
                      <Typography
                        sx={{
                          textAlign: "center",
                          fontSize: 11,
                          color: c.textSoft,
                          my: 1.5,
                        }}
                      >
                        {msg.ts.toDate
                          ? msg.ts.toDate().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
                          : ""}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        mb: 0.3,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: isMobile ? "80%" : "58%",
                          px: 1.8,
                          py: 1,
                          borderRadius: isMe
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          background: isMe
                            ? c.msgBubbleMe
                            : c.msgBubbleOther,
                          color: isMe ? "#fff" : c.msgBubbleOtherText,
                          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.1)",
                          position: "relative",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <Typography fontSize={14} sx={{ lineHeight: 1.5, wordBreak: "break-word" }}>
                          {msg.content || msg.text}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 0.4,
                            mt: 0.3,
                          }}
                        >
                          <Typography fontSize={10} sx={{ color: isMe ? "rgba(255,255,255,0.6)" : (isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)") }}>
                            {timeLabel(msg.ts)}
                          </Typography>
                          {isMe && (
                            <DoneAllIcon
                              sx={{ fontSize: 13, color: msg.read ? "#60a5fa" : (isMe ? "rgba(255,255,255,0.6)" : (isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)")) }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                );
              })}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </Box>

            {/* ─ emoji picker ─ */}
            {showEmoji && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 72,
                  left: isMobile ? 8 : 24,
                  zIndex: 100,
                }}
              >
                <EmojiPicker
                  theme={isDark ? "dark" : "light"}
                  onEmojiClick={(e) => {
                    setInput((p) => p + e.emoji);
                    inputRef.current?.focus();
                  }}
                  height={340}
                  width={300}
                  previewConfig={{ showPreview: false }}
                />
              </Box>
            )}

            {/* ─ quick message chips (shown when input is empty) ─ */}
            {input.length === 0 && (
              <Box
                sx={{
                  px: 2,
                  pb: 0.5,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  background: c.bg,
                }}
              >
                {quickMessages.map((m, i) => (
                  <Box
                    key={i}
                    onClick={() => {
                      setInput(m);
                      setShowEmoji(false);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    sx={{
                      px: 1.5,
                      py: 0.4,
                      borderRadius: "16px",
                      fontSize: 12,
                      cursor: "pointer",
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      color: "#a5b4fc",
                      transition: "all 0.15s",
                      "&:hover": { background: "rgba(99,102,241,0.25)" },
                    }}
                  >
                    {m}
                  </Box>
                ))}
              </Box>
            )}

            {/* ─ input bar ─ */}
            <Box
              sx={{
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderTop: `1px solid ${c.border}`,
                background: c.sidebar,
              }}
            >
              <IconButton
                size="small"
                onClick={() => setShowEmoji((p) => !p)}
                sx={{ color: showEmoji ? "#6366f1" : c.textSoft }}
              >
                <EmojiEmotionsIcon />
              </IconButton>

              <IconButton
                size="small"
                onClick={toggleVoice}
                sx={{
                  color: isListening ? "#ef4444" : c.textSoft,
                  animation: isListening ? "pulse 1.2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.2)" },
                    "100%": { transform: "scale(1)" },
                  },
                }}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>

              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message…"
                value={input}
                inputRef={inputRef}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (socketRef.current && selectedUser) {
                    socketRef.current.emit("typing", { room: "private", username: me.name, receiverId: selectedUser.uid });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "22px",
                  background: c.inputBg,
                  color: c.text,
                  fontSize: 14,
                  border: `1px solid ${c.inputBorder}`,
                  "& textarea::placeholder": { color: c.textSoft },
                  transition: "background 0.3s ease",
                }}
              />

              <IconButton
                onClick={sendMessage}
                disabled={!input.trim()}
                sx={{
                  background: input.trim()
                    ? "linear-gradient(135deg,#6366f1,#9333ea)"
                    : c.inputBg,
                  borderRadius: "12px",
                  width: 42,
                  height: 42,
                  transition: "all 0.2s",
                  "&:hover": { transform: "scale(1.08)" },
                  "&:disabled": { opacity: 0.4 },
                }}
              >
                <SendIcon sx={{ color: "#fff", fontSize: 18 }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>

      {/* ── foreground notification snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, text: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="info"
          onClose={() => setSnackbar({ open: false, text: "" })}
          sx={{ background: isDark ? "#1e293b" : "#fff", color: c.text }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
