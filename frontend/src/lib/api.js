import axios from "axios";

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
    // Check if the server returned a 401 Unauthorized (Expired or invalid token)
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Token expired or invalid. Redirecting to login...");
      
      // 1. LocalStorage aur tokens saaf karein
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user-storage"); // Zustand cache reset

      // 🚨 FIX: Reload karne ke bajaye user ko seedha login page par phenk dein
      // Agar aapka login page "/" (root) par hai to "/" likhein, agar "/login" par hai to "/login" likhein.
      window.location.href = "/login"; 
      
      return Promise.reject(error);
    }

    // Agar 401 ke ilawa koi aur error ho (400, 403, 500) to use reject karein
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