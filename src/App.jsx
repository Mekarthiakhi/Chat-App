import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import AuthTabs from "./components/auth/AuthTabs"; 
import ChatDashboard from "./components/ChatDashboard";
import { logout, updateFcmToken } from "./services/apiAuth";
import { requestNotificationPermission } from "./firebase/messaging";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Theme context for dark/light mode
const ThemeModeContext = createContext({ mode: "dark", toggle: () => {} });
export const useThemeMode = () => useContext(ThemeModeContext);

export default function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem("chat_theme") || "dark");

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("chat_theme", next);
      return next;
    });
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === "dark" ? {
        background: { default: "#0b0f1a", paper: "#131825" },
        primary: { main: "#6366f1" },
        secondary: { main: "#9333ea" },
        text: { primary: "#e2e8f0", secondary: "#94a3b8" },
        action: { hover: "rgba(255,255,255,0.08)", selected: "rgba(99,102,241,0.1)" },
        divider: "rgba(255,255,255,0.06)",
      } : {
        background: { default: "#f8fafc", paper: "#ffffff" },
        primary: { main: "#6366f1" },
        secondary: { main: "#9333ea" },
        text: { primary: "#1e293b", secondary: "#64748b" },
        action: { hover: "rgba(99,102,241,0.08)", selected: "rgba(99,102,241,0.12)" },
        divider: "rgba(0,0,0,0.08)",
        success: { main: "#10b981" },
        error: { main: "#ef4444" },
        warning: { main: "#f59e0b" },
        info: { main: "#3b82f6" },
      }),
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      h5: { fontWeight: 600 },
      body2: { fontSize: "0.9rem" },
      caption: { fontSize: "0.8rem" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
          contained: {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  }), [mode]);

  useEffect(() => {
    const token = localStorage.getItem("chat_token");
    const userStr = localStorage.getItem("chat_user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      const mappedUser = { ...user, uid: user.id, name: user.username };
      setAuth({ token, user: mappedUser });
      syncNotifications();
    }
    setLoading(false);
  }, []);

  const syncNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      await updateFcmToken(token).catch(e => console.warn("Sync FCM error:", e));
    }
  };

  function handleLogin(token, user) {
    const mappedUser = { ...user, uid: user.id, name: user.username };
    setAuth({ token, user: mappedUser });
    syncNotifications();
  }

  const handleLogout = async () => {
    logout();
    setAuth(null);
  };

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: mode === "dark" ? "#0b0f1a" : "#f0f2f5", color: mode === "dark" ? "#fff" : "#1e293b", fontFamily: "sans-serif" }}>
      Loading Chat...
    </div>
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggle: toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthContext.Provider value={auth}>
          {!auth ? (
            <AuthTabs onLogin={handleLogin} />
          ) : (
            <ChatDashboard onLogout={handleLogout} />
          )}
        </AuthContext.Provider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}