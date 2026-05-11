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
import EmojiPicker from "emoji-picker-react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { db, rtdb, auth } from "../firebase/firebase";
import { useAuth } from "../App";
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

/* avatar color seeded from name */
function avatarColor(name = "") {
  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

/* ─── component ────────────────────────────────────────── */

export default function ChatDashboard({ onLogout }) {
  const authCtx = useAuth();
  const me = authCtx?.user;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const messagesEndRef = useRef();
  const inputRef = useRef();
  const socketRef = useRef();

  /* ── 1. request FCM notification permission on mount ─ */
  useEffect(() => {
    requestNotificationPermission().then((token) => {
      if (token && me?.uid) {
        // Store token in MongoDB so backend can target this device
        updateFcmToken(token).catch(err => console.error("FCM token storage error:", err));
      }
    }).catch(err => console.warn("Notification permission error:", err));

    const unsub = onForegroundMessage((payload) => {
      // App is in foreground → show snackbar instead of OS notification
      const sender = payload.notification?.title || "Someone";
      setSnackbar({ open: true, text: `${sender}: ${payload.notification?.body}` });
    });
    return () => unsub();
  }, [me?.uid]);

  /* ── 2. Socket.io initialization & presence ────────── */
  useEffect(() => {
    if (!me?.uid) return;

    // Connect to Node.js backend (dynamic URL)
    const backendBaseUrl = API_URL.replace('/api', '');
    const socket = io(backendBaseUrl);
    socketRef.current = socket;

    socket.emit("user_join", { userId: me.uid, username: me.name });

    socket.on("new_private_message", (msg) => {
      // If the message is for the current selected chat, add it
      setMessages((prev) => {
        const isFromSelected = msg.sender._id === selectedUser?.uid || msg.to === selectedUser?.uid;
        if (isFromSelected) {
          // Check for duplicates
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, { ...msg, senderUid: msg.sender._id, ts: msg.createdAt }];
        }
        return prev;
      });

      // Update unread if not selected
      if (msg.sender._id !== selectedUser?.uid) {
        setUnread((prev) => ({ ...prev, [msg.sender._id]: (prev[msg.sender._id] || 0) + 1 }));
        setSnackbar({ open: true, text: `New message from ${msg.sender.username}` });
      }
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
  }, [me?.uid, selectedUser?.uid]);

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

  /* ── filtered sidebar users ─────────────────────────── */
  const filteredUsers = allUsers.filter((u) =>
    (u.name || u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ── quick messages ─────────────────────────────────── */
  const quickMessages = ["Hey 👋", "How are you?", "What's up?", "Let's chat!", "Good morning ☀️", "😊"];

  /* ─── RENDER ──────────────────────────────────────────── */
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0b0f1a",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ══════════════ SIDEBAR ══════════════ */}
      <Box
        sx={{
          width: isMobile ? "100%" : 320,
          display: isMobile && selectedUser ? "none" : "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
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
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(99,102,241,0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: avatarColor(me?.name),
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {(me?.name || me?.email || "?")[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize={14} lineHeight={1.2}>
                {me?.name || me?.email}
              </Typography>
              <Typography fontSize={11} sx={{ color: "#4ade80" }}>
                ● Online
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} size="small" sx={{ color: "#94a3b8" }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <InputBase
              fullWidth
              placeholder="Search or start new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: 13, color: "#e2e8f0", "& input::placeholder": { color: "#64748b" } }}
            />
          </Box>
        </Box>

        {/* ─ online banner ─ */}
        <Box sx={{ px: 2, pb: 0.5 }}>
          <Typography fontSize={11} sx={{ color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
            {Object.values(onlineMap).filter(Boolean).length} online
          </Typography>
        </Box>

        {/* ─ user list ─ */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
          {filteredUsers.length === 0 && (
            <Typography sx={{ color: "#475569", textAlign: "center", mt: 4, fontSize: 13 }}>
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
                    ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(147,51,234,0.15))"
                    : "transparent",
                  border: isSelected ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    background: isSelected
                      ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(147,51,234,0.15))"
                      : "rgba(255,255,255,0.05)",
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
                      border: "2px solid #0b0f1a",
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
                      bgcolor: avatarColor(user.name || user.email),
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
                  <Typography fontSize={12} sx={{ color: isOnline ? "#4ade80" : "#64748b" }}>
                    {isOnline ? "Online" : "Offline"}
                  </Typography>
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
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: "#475569",
            }}
          >
            <Box sx={{ fontSize: 64 }}>💬</Box>
            <Typography fontWeight={600} fontSize={18}>
              Select a conversation
            </Typography>
            <Typography fontSize={13}>
              Pick someone from the left to start chatting
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
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                zIndex: 10,
              }}
            >
              {isMobile && (
                <IconButton
                  size="small"
                  onClick={() => setSelectedUser(null)}
                  sx={{ color: "#94a3b8" }}
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
                    border: "2px solid #0b0f1a",
                    width: 10,
                    height: 10,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: avatarColor(selectedUser.name || selectedUser.email),
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
                <Typography fontSize={12} sx={{ color: onlineMap[selectedUser.uid] ? "#4ade80" : "#64748b" }}>
                  {onlineMap[selectedUser.uid] ? "Online" : "Offline"}
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
                  "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.04), transparent 60%), #0b0f1a",
              }}
            >
              {messages.length === 0 && (
                <Typography
                  sx={{ textAlign: "center", color: "#475569", fontSize: 13, mt: 8 }}
                >
                  No messages yet. Say hello! 👋
                </Typography>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderUid === me?.uid;
                const showTime =
                  i === 0 ||
                  (msg.ts && messages[i - 1]?.ts &&
                    msg.ts.toDate?.().getDate?.() !==
                    messages[i - 1].ts.toDate?.().getDate?.());

                return (
                  <Box key={msg.id}>
                    {showTime && msg.ts && (
                      <Typography
                        sx={{
                          textAlign: "center",
                          fontSize: 11,
                          color: "#475569",
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
                            ? "linear-gradient(135deg, #6366f1, #9333ea)"
                            : "rgba(255,255,255,0.09)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          position: "relative",
                        }}
                      >
                        <Typography fontSize={14} sx={{ lineHeight: 1.5, wordBreak: "break-word" }}>
                          {msg.text}
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
                          <Typography fontSize={10} sx={{ color: "rgba(255,255,255,0.45)" }}>
                            {timeLabel(msg.ts)}
                          </Typography>
                          {isMe && (
                            <DoneAllIcon
                              sx={{ fontSize: 13, color: msg.read ? "#60a5fa" : "rgba(255,255,255,0.45)" }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

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
                  theme="dark"
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
                  background: "#0b0f1a",
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
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <IconButton
                size="small"
                onClick={() => setShowEmoji((p) => !p)}
                sx={{ color: showEmoji ? "#6366f1" : "#64748b" }}
              >
                <EmojiEmotionsIcon />
              </IconButton>

              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message…"
                value={input}
                inputRef={inputRef}
                onChange={(e) => setInput(e.target.value)}
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
                  background: "rgba(255,255,255,0.07)",
                  color: "#e2e8f0",
                  fontSize: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  "& textarea::placeholder": { color: "#64748b" },
                }}
              />

              <IconButton
                onClick={sendMessage}
                disabled={!input.trim()}
                sx={{
                  background: input.trim()
                    ? "linear-gradient(135deg,#6366f1,#9333ea)"
                    : "rgba(255,255,255,0.07)",
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
          sx={{ background: "#1e293b", color: "#e2e8f0" }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
