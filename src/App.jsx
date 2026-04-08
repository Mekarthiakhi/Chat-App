import React, { createContext, useContext, useState } from "react";
import AuthTabs from "../src/components/auth/AuthTabs"; 
import ChatDashBoard from "../src/components/ChatDashboard";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API_BASE = "http://localhost:5000/api";

async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");

  return data;
}

// ---------- CHAT ----------


// ---------- ROOT ----------
export default function App() {
  const [auth, setAuth] = useState(null);

  function handleLogin(token, user) {
    localStorage.setItem("token", token);
    setAuth({ token, user });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={auth}>
      {!auth ? (
        <AuthTabs onLogin={handleLogin} apiCall={apiCall} />  // ✅ USE YOUR UI
      ) : (
        <ChatDashBoard onLogout={handleLogout} />
      )}
    </AuthContext.Provider>
  );
}