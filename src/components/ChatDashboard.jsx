import {
  Box,
  Typography,
  Avatar,
  Badge,
  InputBase,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useRef, useEffect } from "react";

const users = [
  { name: "Ava", age: 24, online: true, gender: "girl" },
  { name: "Mia", age: 22, online: true, gender: "girl" },
  { name: "John", age: 28, online: true, gender: "boy" },
  { name: "Alex", age: 30, online: false, gender: "boy" },
  { name: "AI Assistant", age: null, online: true, type: "ai" },
];

export default function ChatDashboard() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("online");

  const inputRef = useRef();
  const typingRef = useRef();
  const messagesEndRef = useRef();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const quickMessages = [
    "Hey 😊",
    "How are you?",
    "What are you doing?",
    "Let's catch up!",
    "Good morning ☀️",
    "Good night 🌙"
  ];

  const stats = {
    online: users.filter(u => u.online).length,
    male: users.filter(u => u.gender === "boy").length,
    female: users.filter(u => u.gender === "girl").length,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedUser]);

  const getFilteredUsers = () => {
    if (activeTab === "online") return users.filter(u => u.online);
    if (activeTab === "male") return users.filter(u => u.gender === "boy");
    if (activeTab === "female") return users.filter(u => u.gender === "girl");
    return users;
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    const key = selectedUser.name;

    const msg = {
      from: "me",
      text: input,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), msg]
    }));

    setInput("");
    setReceiverTyping(true);

    setTimeout(() => {
      const reply = {
        from: "them",
        text: "Nice 🙂",
        time: new Date().toLocaleTimeString()
      };

      setMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), reply]
      }));

      setReceiverTyping(false);
    }, 1200);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "#0f172a", color: "#fff" }}>

      {/* SIDEBAR */}
      <Box
        sx={{
          width: isMobile ? "100%" : 300,
          p: 2,
          borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
          display: isMobile && selectedUser ? "none" : "block"
        }}
      >
        {/* TABS */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {["online", "male", "female"].map((tab) => (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 2,
                py: 0.7,
                borderRadius: "20px",
                cursor: "pointer",
                background: activeTab === tab
                  ? "linear-gradient(135deg,#6366f1,#9333ea)"
                  : "rgba(255,255,255,0.08)"
              }}
            >
              {tab === "online" && `Online ${stats.online}`}
              {tab === "male" && `👦 ${stats.male}`}
              {tab === "female" && `👧 ${stats.female}`}
            </Box>
          ))}
        </Box>

        {/* USER LIST */}
        {getFilteredUsers().map((user, i) => (
          <Box
            key={i}
            onClick={() => setSelectedUser(user)}
            sx={{
              display: "flex",
              gap: 2,
              p: 1.5,
              borderRadius: "12px",
              cursor: "pointer",
              mb: 1,
              background: selectedUser?.name === user.name
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.05)"
            }}
          >
            <Badge overlap="circular" variant="dot" color="success" invisible={!user.online}>
              <Avatar>{user.name[0]}</Avatar>
            </Badge>

            <Box>
              <Typography>{user.name}</Typography>
              <Typography fontSize={12} opacity={0.6}>
                {user.age ? `${user.age} yrs` : "AI"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* CHAT AREA */}
      <Box
        sx={{
          flex: 1,
          display: isMobile && !selectedUser ? "none" : "flex",
          flexDirection: "column"
        }}
      >

        {/* HEADER */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            position: "sticky",
            top: 0,
            background: "#0f172a",
            zIndex: 10
          }}
        >
          {isMobile && selectedUser && (
            <Box
              onClick={() => setSelectedUser(null)}
              sx={{
                minWidth: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)"
              }}
            >
              ←
            </Box>
          )}

          {selectedUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
              <Avatar sx={{ width: 36, height: 36 }}>
                {selectedUser.name[0]}
              </Avatar>

              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  fontWeight={600}
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {selectedUser.name}
                </Typography>

                <Typography fontSize={12} opacity={0.6}>
                  {selectedUser.online ? "Online" : "Offline"}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* MESSAGES */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1
          }}
        >
          {(messages[selectedUser?.name] || []).map((msg, i) => {
            const isMe = msg.from === "me";

            return (
              <Box key={i} sx={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <Box
                  sx={{
                    background: isMe
                      ? "linear-gradient(135deg,#6366f1,#9333ea)"
                      : "rgba(255,255,255,0.1)",
                    px: 2,
                    py: 1,
                    borderRadius: "16px",
                    maxWidth: isMobile ? "80%" : "60%"
                  }}
                >
                  {msg.text}
                  <Typography fontSize={10}>{msg.time}</Typography>
                </Box>
              </Box>
            );
          })}

          {receiverTyping && selectedUser && (
            <Typography fontSize={12} opacity={0.5}>
              {selectedUser.name} is typing...
            </Typography>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* FOOTER */}
        {selectedUser && (
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", p: 2 }}>
            {input.length === 0 && (
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {quickMessages.map((msg, i) => (
                  <Box
                    key={i}
                    onClick={() => setInput(msg)}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: 12,
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.08)"
                    }}
                  >
                    {msg}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1 }}>
              <InputBase
                fullWidth
                placeholder="Type message..."
                value={input}
                inputRef={inputRef}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff"
                }}
              />

              <IconButton onClick={sendMessage}>
                <SendIcon sx={{ color: "#fff" }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
