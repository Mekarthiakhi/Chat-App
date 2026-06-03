import {
  Box,
  Typography,
  Avatar,
  Badge,
  TextField,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  List,
  ListItemButton,
  Divider,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function avatarColor(name = "", gender = "") {
  if (gender === "Male") return "#3b82f6";
  if (gender === "Female") return "#ec4899";
  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

export default function UserListPanel({
  users = [],
  selectedUser,
  onSelectUser,
  isDark = true,
  currentUser
}) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter === "All" || user.gender === genderFilter;
      return matchesSearch && matchesGender && user._id !== currentUser?.uid;
    });
  }, [users, search, genderFilter, currentUser]);

  const c = {
    bg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#e2e8f0" : "#1e293b",
    textMuted: isDark ? "#64748b" : "#94a3b8",
    hover: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
    selected: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"
  };

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : 280,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: c.bg,
        borderLeft: isMobile ? "none" : `1px solid ${c.border}`,
        borderRight: isMobile ? `1px solid ${c.border}` : "none"
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${c.border}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: c.text }}>
          Online Users
        </Typography>

        {/* Search */}
        <TextField
          placeholder="Search users..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 18, color: "#6366f1" }} />,
            endAdornment: search && (
              <IconButton size="small" onClick={() => setSearch("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )
          }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              borderRadius: "8px"
            }
          }}
        />

        {/* Gender Filter */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
          {["All", "Male", "Female"].map(gender => (
            <Chip
              key={gender}
              icon={gender === "Male" ? <MaleIcon /> : gender === "Female" ? <FemaleIcon /> : undefined}
              label={gender}
              size="small"
              onClick={() => setGenderFilter(gender)}
              variant={genderFilter === gender ? "filled" : "outlined"}
              sx={{
                background: genderFilter === gender ? "linear-gradient(135deg, #6366f1, #9333ea)" : "transparent",
                color: genderFilter === gender ? "#fff" : c.text,
                cursor: "pointer"
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Users List */}
      <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
        <AnimatePresence>
          {filteredUsers.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color={c.textMuted}>
                No users found
              </Typography>
            </Box>
          ) : (
            filteredUsers.map((user, idx) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ListItemButton
                  onClick={() => onSelectUser(user)}
                  selected={selectedUser?._id === user._id}
                  sx={{
                    p: 1.5,
                    borderBottom: `1px solid ${c.border}`,
                    background: selectedUser?._id === user._id ? c.selected : "transparent",
                    "&:hover": {
                      background: selectedUser?._id === user._id ? c.selected : c.hover
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, width: "100%", alignItems: "center" }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                      sx={{
                        "& .MuiBadge-badge": {
                          background: user.isOnline ? "#10b981" : "#64748b",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          border: `2px solid ${isDark ? "#131825" : "#fff"}`
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          background: avatarColor(user.username, user.gender),
                          width: 40,
                          height: 40,
                          fontWeight: 600
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: c.text,
                            truncate: "ellipsis",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {user.username}
                        </Typography>
                        {user.gender === "Male" ? (
                          <MaleIcon sx={{ fontSize: 14, color: "#3b82f6" }} />
                        ) : user.gender === "Female" ? (
                          <FemaleIcon sx={{ fontSize: 14, color: "#ec4899" }} />
                        ) : null}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: c.textMuted,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {user.country || "Unknown"}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemButton>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </List>

      {/* Footer Stats */}
      <Divider />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color={c.textMuted}>
          {filteredUsers.length} users online
        </Typography>
      </Box>
    </Box>
  );
}
