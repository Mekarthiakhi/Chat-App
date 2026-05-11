import React, { createContext, useContext, useState, useEffect } from "react";
import AuthTabs from "./components/auth/AuthTabs"; 
import ChatDashboard from "./components/ChatDashboard";
import { logout, updateFcmToken } from "./services/apiAuth";
import { requestNotificationPermission } from "./firebase/messaging";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 Check for existing session
    const token = localStorage.getItem("chat_token");
    const userStr = localStorage.getItem("chat_user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      // Map MongoDB fields to Firebase-style fields for compatibility
      const mappedUser = { ...user, uid: user.id, name: user.username };
      setAuth({ token, user: mappedUser });
      syncNotifications();
    }
    setLoading(false);
  }, []);

  const syncNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      console.log("🔔 FCM Token:", token);
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
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0f1a", color: "#fff", fontFamily: "sans-serif" }}>
      Loading Chat...
    </div>
  );

  return (
    <AuthContext.Provider value={auth}>
      {!auth ? (
        <AuthTabs onLogin={handleLogin} />
      ) : (
        <ChatDashboard onLogout={handleLogout} />
      )}
    </AuthContext.Provider>
  );
}