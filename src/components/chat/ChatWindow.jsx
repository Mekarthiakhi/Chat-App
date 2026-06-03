import {
  Box,
  Typography,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  Skeleton
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useEffect, useRef } from "react";

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

function avatarColor(name = "", gender = "") {
  if (gender === "Male") return "#3b82f6";
  if (gender === "Female") return "#ec4899";
  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

export default function ChatWindow({
  messages,
  currentUser,
  selectedUser,
  typingUser,
  onMessageRead,
  isDark,
  loading = false
}) {
  const endRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const c = {
    bg: isDark ? "#0b0f1a" : "#f0f2f5",
    msgOwn: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)",
    msgOther: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    text: isDark ? "#e2e8f0" : "#1e293b",
    textMuted: isDark ? "#475569" : "#94a3b8",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3, display: "flex", flexDirection: "column", gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={50} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: c.bg
      }}
    >
      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: isMobile ? 1.5 : 3,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "&::-webkit-scrollbar": {
            width: "6px"
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent"
          },
          "&::-webkit-scrollbar-thumb": {
            background: c.border,
            borderRadius: "3px"
          }
        }}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <Typography color={c.textMuted} textAlign="center">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender?._id === currentUser?.uid || msg.senderId === currentUser?.uid;
              
              return (
                <motion.div
                  key={msg._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: isMobile ? "85%" : "60%",
                      p: isMobile ? 1.5 : 2,
                      background: isOwn ? c.msgOwn : c.msgOther,
                      border: `1px solid ${c.border}`,
                      borderRadius: isOwn ? "16px 4px 16px 16px" : "4px 16px 16px 16px"
                    }}
                  >
                    {!isOwn && (
                      <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 600, mb: 0.5 }}>
                        {msg.sender?.username || msg.senderName}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: c.text,
                        wordBreak: "break-word",
                        my: 0.5
                      }}
                    >
                      {msg.content || msg.text}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, justifyContent: "flex-end" }}>
                      <Typography variant="caption" sx={{ color: c.textMuted }}>
                        {timeLabel(msg.createdAt)}
                      </Typography>
                      {isOwn && msg.isRead && (
                        <DoneAllIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", gap: 8 }}
          >
            <Typography variant="caption" sx={{ color: c.textMuted, fontStyle: "italic" }}>
              {typingUser} is typing...
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#6366f1"
                  }}
                />
              ))}
            </Box>
          </motion.div>
        )}

        <div ref={endRef} />
      </Box>
    </Box>
  );
}
