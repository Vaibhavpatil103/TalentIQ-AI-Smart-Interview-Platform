import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const serverUrl = apiUrl.replace(/\/api\/?$/, "");

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socketInstance;
};
