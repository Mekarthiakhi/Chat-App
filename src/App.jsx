import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const API_BASE = 'http://localhost:5000/api';

async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ---------- LOGIN ----------
function LoginPage({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ username: '', password: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await apiCall('/login', 'POST', form);
    onLogin(data.token, data.user);
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username"
          onChange={e => setForm({ ...form, username: e.target.value })} />
        <input type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button>Login</button>
      </form>
      <p onClick={onSwitch}>Register</p>
    </div>
  );
}

// ---------- REGISTER ----------
function RegisterPage({ onLogin, onSwitch }) {
  const [form, setForm] = useState({
    username: '', email: '', password: ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await apiCall('/register', 'POST', form);
    onLogin(data.token, data.user);
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username"
          onChange={e => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button>Register</button>
      </form>
      <p onClick={onSwitch}>Login</p>
    </div>
  );
}

// ---------- CHAT ----------
function ChatApp({ onLogout }) {
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome {user.username}</h2>
      <button onClick={onLogout}>Logout</button>
      <p>Chat UI Loaded ✅</p>
    </div>
  );
}

// ---------- ROOT ----------
export default function App() {
  const [page, setPage] = useState('login');
  const [auth, setAuth] = useState(null);

  function handleLogin(token, user) {
    localStorage.setItem('token', token);
    setAuth({ token, user });
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setAuth(null);
    setPage('login');
  }

  return (
    <AuthContext.Provider value={auth}>
      {!auth ? (
        page === 'login'
          ? <LoginPage onLogin={handleLogin} onSwitch={() => setPage('register')} />
          : <RegisterPage onLogin={handleLogin} onSwitch={() => setPage('login')} />
      ) : (
        <ChatApp onLogout={handleLogout} />
      )}
    </AuthContext.Provider>
  );
}