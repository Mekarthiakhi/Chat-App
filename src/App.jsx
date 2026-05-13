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
      } : {
        background: { default: "#f0f2f5", paper: "#ffffff" },
        primary: { main: "#6366f1" },
        secondary: { main: "#9333ea" },
      }),
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    shape: { borderRadius: 12 },
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