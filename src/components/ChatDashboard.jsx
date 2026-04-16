import {
  Box,
  Typography,
  Avatar,
  Badge,
  InputBase,
  IconButton
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
      <Box sx={{ width: 300, p: 2, borderRight: "1px solid rgba(255,255,255,0.08)" }}>

        {/* TABS */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Box
            onClick={() => setActiveTab("online")}
            sx={{
              px: 2, py: 0.7, borderRadius: "20px", cursor: "pointer",
              display: "flex", gap: 1,
              background: activeTab === "online"
                ? "linear-gradient(135deg,#6366f1,#9333ea)"
                : "rgba(255,255,255,0.08)"
            }}
          >
            Online <Box fontSize={11}>{stats.online}</Box>
          </Box>

          <Box
            onClick={() => setActiveTab("male")}
            sx={{
              px: 2, py: 0.7, borderRadius: "20px", cursor: "pointer",
              background: activeTab === "male"
                ? "linear-gradient(135deg,#6366f1,#9333ea)"
                : "rgba(255,255,255,0.08)"
            }}
          >
            👦 {stats.male}
          </Box>

          <Box
            onClick={() => setActiveTab("female")}
            sx={{
              px: 2, py: 0.7, borderRadius: "20px", cursor: "pointer",
              background: activeTab === "female"
                ? "linear-gradient(135deg,#6366f1,#9333ea)"
                : "rgba(255,255,255,0.08)"
            }}
          >
            👧 {stats.female}
          </Box>
        </Box>

        {/* USER LIST */}
        {getFilteredUsers().map((user, i) => (
          <Box
            key={i}
            onClick={() => setSelectedUser(user)}
            sx={{
              display: "flex", gap: 2, p: 1.5,
              borderRadius: "12px", cursor: "pointer", mb: 1,
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
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {selectedUser && (
            <>
              <Typography fontWeight={600}>{selectedUser.name}</Typography>
              <Typography fontSize={12} opacity={0.6}>
                {selectedUser.age ? `${selectedUser.age} yrs • ` : ""}
                {selectedUser.online ? "Online" : "Offline"}
              </Typography>
            </>
          )}
        </Box>

        {/* MESSAGES */}
        <Box sx={{
          flex: 1, overflowY: "auto", px: 2, py: 2,
          display: "flex", flexDirection: "column", gap: 1
        }}>
          {(messages[selectedUser?.name] || []).map((msg, i) => {
            const isMe = msg.from === "me";

            return (
              <Box key={i} sx={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <Box sx={{
                  background: isMe
                    ? "linear-gradient(135deg,#6366f1,#9333ea)"
                    : "rgba(255,255,255,0.1)",
                  px: 2, py: 1, borderRadius: "16px", maxWidth: "60%"
                }}>
                  {msg.text}
                  <Typography fontSize={10}>{msg.time}</Typography>
                </Box>
              </Box>
            );
          })}

          {/* Typing */}
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

            {/* QUICK */}
            {input.length === 0 && (
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {quickMessages.map((msg, i) => (
                  <Box
                    key={i}
                    onClick={() => {
                      setInput(msg);
                      inputRef.current?.focus();
                    }}
                    sx={{
                      px: 2, py: 0.5, borderRadius: "20px",
                      fontSize: 12, cursor: "pointer",
                      background: "rgba(255,255,255,0.08)"
                    }}
                  >
                    {msg}
                  </Box>
                ))}
              </Box>
            )}

            {/* INPUT */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <InputBase
                fullWidth
                placeholder="Type message..."
                value={input}
                inputRef={inputRef}
                onChange={(e) => {
                  setInput(e.target.value);
                  clearTimeout(typingRef.current);
                  setReceiverTyping(true);
                  typingRef.current = setTimeout(() => {
                    setReceiverTyping(false);
                  }, 1000);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{
                  px: 2, py: 1,
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