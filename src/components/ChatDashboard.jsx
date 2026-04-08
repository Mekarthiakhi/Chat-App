import {
  Box,
  Typography,
  Avatar,
  Badge,
  InputBase,
  IconButton
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import ParticlesBg from "../components/ParticlesBg";
import { useRef, useEffect,useState } from "react";

const users = [
  { name: "Ava", age: 24, online: true, gender: "girl", type: "user" },
  { name: "Mia", age: 22, online: true, gender: "girl", type: "user" },
  { name: "John", age: 28, online: true, gender: "boy", type: "user" },
  { name: "Alex", age: 30, online: false, gender: "boy", type: "user" },
  { name: "AI Assistant", age: null, online: true, type: "ai" },
];

export default function ChatDashboard() {
  const [selectedUser, setSelectedUser] = useState(null);
const [messages, setMessages] = useState({});  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("online");
  const [history, setHistory] = useState([]);
  const [genderFilter, setGenderFilter] = useState("boy");
  const inputRef = useRef();

  const suggestions = [
    "Hey 😊",
    "How was your day?",
    "You look amazing ❤️",
  ];

  useEffect(() => {
  if (selectedUser && inputRef.current) {
    inputRef.current.focus();
  }
}, [selectedUser]);

 const sendMessage = () => {
  if (!input.trim() || !selectedUser) return;

  const userKey = selectedUser.name;

  const newMsg = {
    from: "me",
    text: input,
    time: new Date().toLocaleTimeString()
  };

  setMessages(prev => ({
    ...prev,
    [userKey]: [
      ...(prev[userKey] || []),
      newMsg
    ]
  }));

  setInput("");
  setIsTyping(false);
};

const [isTyping, setIsTyping] = useState(false);
  // 🔥 FILTER LOGIC
  const getFilteredUsers = () => {
    if (activeTab === "online") return users;

    if (activeTab === "gender") {
      return users.filter(u => u.gender === genderFilter);
    }

    if (activeTab === "ai") {
      return users.filter(u => u.type === "ai");
    }

    if (activeTab === "history") {
      return history;
    }

    return users;
  };

  const messagesEndRef = useRef();

  

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, selectedUser]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        position: "relative",
        background:
          "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
        overflow: "hidden",
      }}
    >
      {/* 🌌 PARTICLES */}
      <ParticlesBg />

      {/* 🔥 SIDEBAR */}
      <Box
        sx={{
          width: 320,
          p: 2,
          zIndex: 1,
          backdropFilter: "blur(25px)",
          background: "rgba(255,255,255,0.06)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        }}
      >
        {/* ✅ TABS */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {["online", "gender", "history", "ai"].map(tab => (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: 12,
                textTransform: "capitalize",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg,#ff00cc,#3333ff)"
                    : "rgba(255,255,255,0.1)",
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* ✅ GENDER TOGGLE */}
        {activeTab === "gender" && (
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Box
              onClick={() => setGenderFilter("boy")}
              sx={{ cursor: "pointer" }}
            >
              👦 Boys
            </Box>
            <Box
              onClick={() => setGenderFilter("girl")}
              sx={{ cursor: "pointer" }}
            >
              👧 Girls
            </Box>
          </Box>
        )}

        {/* SEARCH */}
        <InputBase
          placeholder="Search..."
          sx={{
            px: 2,
            py: 1,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            width: "100%",
            mb: 2,
          }}
        />

        {/* USER LIST */}
        {getFilteredUsers().map((user, i) => (
          <Box
            key={i}
            onClick={() => {
              setSelectedUser(user);

              // ✅ SAVE HISTORY
              setHistory(prev => {
                const exists = prev.find(u => u.name === user.name);
                if (exists) return prev;
                return [user, ...prev];
              });
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: "14px",
              cursor: "pointer",
              mb: 1,
              transition: "0.2s",
              backdropFilter: "blur(25px)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": {
                background: "rgba(255,255,255,0.12)",
                transform: "scale(1.02)",
                boxShadow: "0 0 20px rgba(255,0,200,0.6)",
              },
            }}
          >
            <Badge
              overlap="circular"
              variant="dot"
              color="success"
              invisible={!user.online}
            >
              <Avatar>{user.name[0]}</Avatar>
            </Badge>

            <Box>
              <Typography sx={{ fontWeight: 500 }}>
                {user.name}
              </Typography>
              <Typography fontSize={12} opacity={0.7}>
                {user.age ? `${user.age} yrs` : "AI Chat"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* 💬 CHAT AREA */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            p: 2,
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {selectedUser ? selectedUser.name : "Select a chat 💕"}
        </Box>

        {/* MESSAGES */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            overflowY: "auto",
          }}
        >
          {!selectedUser ? (
            <Typography color="gray" m="auto">
              Start chatting ✨
            </Typography>
          ) : (
      (messages[selectedUser?.name] || []).map((msg, i) => (
  <Box
    key={i}
    sx={{
      alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
      background: msg.from === "me" ? "#ff00cc" : "#ffffff20",
      color: "#fff",
      p: 1,
      borderRadius: 2,
      mb: 1
    }}
  >
    {msg.text}
    <Typography fontSize={10} opacity={0.6}>
      {msg.time}
    </Typography>
  </Box>
))
          )}
        </Box>

        {/* SUGGESTIONS */}
        {selectedUser && (
          <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1 }}>
            {suggestions.map((s, i) => (
              <Box
                key={i}
               onClick={() => {
  setInput(s);
 
}}
onMouseDown={(e) => {
  e.preventDefault();
  setInput(s);
  inputRef.current?.focus(); // 🔥 immediate focus
}}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  fontSize: "12px",
                  color:"#fff"
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
        )}

        {/* INPUT */}
        {selectedUser && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 1,
              backdropFilter: "blur(20px)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <InputBase
              placeholder="Type a message..."
              value={input}
                inputRef={inputRef}
              onChange={(e) => {
  setInput(e.target.value);
  setIsTyping(true);

  // ⛔ IMPORTANT FIX
  clearTimeout(window.typingTimer);
  window.typingTimer = setTimeout(() => {
    setIsTyping(false);
  }, 1000);
}}
              onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }}
              sx={{
                flex: 1,
                px: 2,
                py: 1,
                borderRadius: "20px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            />

            <IconButton
              onClick={sendMessage}
              sx={{
                background:
                  "linear-gradient(135deg,#ff00cc,#3333ff)",
                color: "#fff",
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}