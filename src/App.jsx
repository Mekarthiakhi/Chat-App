import React, { createContext, useContext, useState, useEffect } from "react";
import AuthTabs from "./components/auth/AuthTabs"; 
import ChatDashboard from "./components/ChatDashboard";
import { auth as firebaseAuth, rtdb } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set } from "firebase/database";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 Firebase Authentication & Persistence
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setAuth({
          token: user.accessToken,
          user: {
            uid: user.uid,
            name: user.displayName || user.email,
            email: user.email,
          },
        });
      } else {
        setAuth(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function handleLogin(token, user) {
    setAuth({ token, user });
  }

  const handleLogout = async () => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        // Set presence to offline before signing out
        await set(ref(rtdb, `presence/${currentUser.uid}`), {
          online: false,
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email,
        });
      }
      await signOut(firebaseAuth);
      setAuth(null);
    } catch (err) {
      console.error("Logout error:", err);
      // Fallback: just clear state
      setAuth(null);
    }
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