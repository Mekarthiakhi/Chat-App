import React, { createContext, useContext, useState } from "react";
import AuthTabs from "../src/components/auth/AuthTabs"; 

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
function ChatApp({ onLogout }) {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.username}</h2>
      <button onClick={onLogout}>Logout</button>
      <p>Chat UI Loaded ✅</p>
    </div>
  );
}

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
        <ChatApp onLogout={handleLogout} />
      )}
    </AuthContext.Provider>
  );
}