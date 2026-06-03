import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import EmojiPicker from "emoji-picker-react";
import { useState, useCallback } from "react";

export default function ChatInput({
  message,
  onMessageChange,
  onSendMessage,
  onTyping,
  loading = false,
  isDark = true
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const c = {
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    inputBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    text: isDark ? "#e2e8f0" : "#1e293b",
    placeholder: isDark ? "#64748b" : "#94a3b8",
  };

  const handleEmojiClick = (emojiObject) => {
    onMessageChange(message + emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSendMessage();
    }
  }, [message, onSendMessage]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.type === "change") {
      onTyping();
    }
  };

  return (
    <Box
      sx={{
        p: isMobile ? 1.5 : 2,
        background: isDark ? "#0b0f1a" : "#f8fafc",
        borderTop: `1px solid ${c.inputBorder}`,
        display: "flex",
        gap: 1,
        alignItems: "flex-end"
      }}
    >
      {/* Emoji Picker Button */}
      <Tooltip title="Add emoji">
        <IconButton
          size="small"
          onClick={() => setShowEmoji(!showEmoji)}
          sx={{ color: "#6366f1" }}
        >
          <EmojiEmotionsIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>

      {/* Message Input */}
      <InputBase
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        multiline
        maxRows={4}
        sx={{
          flex: 1,
          px: isMobile ? 1.5 : 2,
          py: 1,
          background: c.inputBg,
          border: `1px solid ${c.inputBorder}`,
          borderRadius: "12px",
          color: c.text,
          fontSize: isMobile ? "0.9rem" : "1rem",
          transition: "all 0.2s ease",
          "& input::placeholder, & textarea::placeholder": {
            color: c.placeholder,
            opacity: 0.7
          },
          "&:hover": {
            borderColor: "#6366f1",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
          },
          "&.Mui-focused": {
            borderColor: "#6366f1",
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
          }
        }}
      />

      {/* Microphone Button */}
      <Tooltip title="Voice message">
        <IconButton
          size="small"
          sx={{ color: "#9333ea" }}
        >
          <MicIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>

      {/* Send Button */}
      <Tooltip title="Send message (Enter)">
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || loading}
          sx={{
            color: "#fff",
            background: "linear-gradient(135deg, #6366f1, #9333ea)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              transform: "scale(1.05)"
            },
            "&:disabled": {
              background: "rgba(99,102,241,0.3)",
              color: "rgba(255,255,255,0.5)"
            },
            transition: "all 0.2s ease"
          }}
        >
          <SendIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>

      {/* Emoji Picker Dialog */}
      <Dialog
        open={showEmoji}
        onClose={() => setShowEmoji(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: isDark ? "#131825" : "#fff",
            backgroundImage: "none"
          }
        }}
      >
        <DialogTitle sx={{ p: 1 }}>Select Emoji</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={isDark ? "dark" : "light"}
            height={300}
            width="100%"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
