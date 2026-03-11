import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { WebSocketServer } from "ws";
import * as Y from "yjs";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest } from "./lib/inngestClient.js";
import { functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import problemRoutes from "./routes/problemRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const server = http.createServer(app);

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// ─── Yjs WebSocket Server ────────────────────────────────────────
const wss = new WebSocketServer({ server, path: "/yjs" });

// Store Yjs documents by room name (sessionId)
const docs = new Map();

function getYDoc(roomName) {
  if (!docs.has(roomName)) {
    const doc = new Y.Doc();
    docs.set(roomName, { doc, conns: new Set() });
  }
  return docs.get(roomName);
}

wss.on("connection", (ws, req) => {
  // Room name from query param: ws://host/yjs?room=sessionId
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomName = url.searchParams.get("room") || "default";

  const room = getYDoc(roomName);
  room.conns.add(ws);

  console.log(`[Yjs] Client connected to room: ${roomName} (${room.conns.size} clients)`);

  // Send current document state to the new client
  const update = Y.encodeStateAsUpdate(room.doc);
  if (update.length > 0) {
    ws.send(update);
  }

  ws.on("message", (message) => {
    try {
      // 🚨 CRITICAL FIX: The `ws` library returns Node Buffers which are views over 
      // a shared slab of memory. We MUST create a true copy for Yjs/lib0 
      // to decode it properly without "Unexpected end of array" bounds issues.
      const bufferCopy = Buffer.from(message);
      const update = new Uint8Array(bufferCopy);
      
      Y.applyUpdate(room.doc, update);

      // Broadcast to all other clients in the room
      for (const conn of room.conns) {
        if (conn !== ws && conn.readyState === 1) {
          conn.send(update);
        }
      }
    } catch (err) {
      console.error("[Yjs] Error applying update:", err);
    }
  });

  ws.on("close", () => {
    room.conns.delete(ws);
    console.log(`[Yjs] Client disconnected from room: ${roomName} (${room.conns.size} clients)`);

    // Clean up empty rooms after 5 minutes
    if (room.conns.size === 0) {
      setTimeout(() => {
        const current = docs.get(roomName);
        if (current && current.conns.size === 0) {
          current.doc.destroy();
          docs.delete(roomName);
          console.log(`[Yjs] Room cleaned up: ${roomName}`);
        }
      }, 5 * 60 * 1000);
    }
  });
});

// ─── Production static files ─────────────────────────────────────
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ─── Global Error Handlers ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(ENV.PORT, () =>
      console.log(`Server is running on port: ${ENV.PORT} (HTTP + Yjs WebSocket)`)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
