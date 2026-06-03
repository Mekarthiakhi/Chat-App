import {
  Box,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupsIcon from "@mui/icons-material/Groups";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { motion } from "framer-motion";

const ROOMS = [
  { id: 'general', name: 'General', icon: ChatIcon, color: '#6366f1', desc: 'General Chat' },
  { id: 'flirt', name: 'Flirt', icon: FavoriteBorderIcon, color: '#ec4899', desc: 'Flirt Corner' },
  { id: 'friends', name: 'Friends', icon: GroupsIcon, color: '#10b981', desc: 'Make Friends' },
  { id: 'random', name: 'Random', icon: ShuffleIcon, color: '#f59e0b', desc: 'Random Chat' }
];

export default function RoomSelector({
  currentRoom,
  onRoomChange,
  unreadCounts = {},
  isDark = true
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const c = {
    bg: isDark ? "#0b0f1a" : "#f8fafc",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    activeTab: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)",
    text: isDark ? "#e2e8f0" : "#1e293b",
    textMuted: isDark ? "#64748b" : "#94a3b8"
  };

  return (
    <Box
      sx={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        px: isMobile ? 1 : 3,
        py: 1
      }}
    >
      <Tabs
        value={currentRoom}
        onChange={(e, newValue) => onRoomChange(newValue)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          "& .MuiTabs-indicator": {
            background: "linear-gradient(135deg, #6366f1, #9333ea)",
            height: 3
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: isMobile ? "0.85rem" : "1rem",
            color: c.textMuted,
            transition: "all 0.3s ease",
            position: "relative",
            "&:hover": {
              color: c.text
            }
          },
          "& .Mui-selected": {
            color: c.text,
            background: c.activeTab,
            borderRadius: "8px"
          }
        }}
      >
        {ROOMS.map((room) => {
          const Icon = room.icon;
          const unreadCount = unreadCounts[room.id] || 0;

          return (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip title={room.desc} arrow>
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, position: "relative" }}>
                      <Icon sx={{ fontSize: isMobile ? 18 : 22, color: room.color }} />
                      {!isMobile && <span>{room.name}</span>}
                      {unreadCount > 0 && (
                        <Badge
                          badgeContent={unreadCount}
                          color="error"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontSize: "0.65rem",
                              height: 16,
                              minWidth: 16,
                              borderRadius: "8px"
                            }
                          }}
                        />
                      )}
                    </Box>
                  }
                  value={room.id}
                />
              </Tooltip>
            </motion.div>
          );
        })}
      </Tabs>
    </Box>
  );
}
