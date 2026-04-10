import { io } from "socket.io-client";

// If VITE_API_URL is provided (cross-domain), use it.
// If not, default to current origin (monolith mode) or localhost:5001 in dev.
const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : window.location.origin);

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually when authenticated
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 5000,
});

export const connectSocket = (user) => {
  if (!socket.connected && user) {
    socket.connect();
    socket.emit("register", { userId: user._id, role: user.role });
    console.log("[SOCKET] Connected and registered");
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("[SOCKET] Disconnected");
  }
};
