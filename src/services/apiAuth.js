import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export { API_URL };

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (username, password) => {
  const res = await api.post('/login', { username, password });
  if (res.data.token) {
    localStorage.setItem('chat_token', res.data.token);
    localStorage.setItem('chat_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post('/register', userData);
  if (res.data.token) {
    localStorage.setItem('chat_token', res.data.token);
    localStorage.setItem('chat_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

export const updateFcmToken = async (fcmToken) => {
  return await api.post('/users/fcm-token', { fcmToken });
};

export const logout = () => {
  localStorage.removeItem('chat_token');
  localStorage.removeItem('chat_user');
};

export default api;
