import axios from "axios";
import { socket } from "./socket";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// ─── TOKEN HELPERS ───
export const setTokens = (token) => {
  localStorage.setItem('accessToken', token);
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user-storage'); // Zustand persisted state ko clear karne ke liye
};

// ─── REQUEST INTERCEPTOR (Attach token automatically) ───
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR (Handle Token Expiration / 401) ───
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Token expired. Disconnecting socket and redirecting...");
      
      // 1. Socket disconnect karein
      if (socket) {
        socket.disconnect();
      }

      // 2. Tokens clear karein
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user-storage"); 
localStorage.removeItem("userId"); 
      // 3. Login page par bhejein
      window.location.href = "/login"; 
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ─── AUTH API ───
export const authApi = {
  signup: (data) => api.post("/api/auth/signup", data).then(r => r.data),
  login: (data) => api.post("/api/auth/login", data).then(r => r.data),
  getMe: () => api.get("/api/auth/me").then(r => r.data),
};

export default api;