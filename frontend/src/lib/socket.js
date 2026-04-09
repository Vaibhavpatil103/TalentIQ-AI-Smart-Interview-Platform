import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const serverUrl = apiUrl.replace(/\/api\/?$/, "");

let socketInstance = null;

/**
 * Get the singleton Socket.IO instance.
 * Requires a Clerk session token for authentication.
 * @param {function} getToken - Clerk's getToken function from useAuth()
 */
export const getSocket = (getToken) => {
  if (!socketInstance) {
    socketInstance = io(serverUrl, {
      withCredentials: true,
      autoConnect: false, // Don't connect until we have a token
    });
  }

  // If a getToken function is provided and socket isn't connected, authenticate and connect
  if (getToken && !socketInstance.connected) {
    getToken()
      .then((token) => {
        if (token) {
          socketInstance.auth = { token };
          socketInstance.connect();
        }
      })
      .catch((err) => {
        console.error("[Socket] Failed to get auth token:", err);
      });
  }

  return socketInstance;
};
