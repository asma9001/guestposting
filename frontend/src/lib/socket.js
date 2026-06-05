import { io } from "socket.io-client";

const URL = "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false,
});

// Add these global listeners to see the status in your browser console
socket.on("connect", () => {
  console.log("✅ Socket connected successfully! ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});