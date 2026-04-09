import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { serve } from "inngest/express";
import { clerkMiddleware, clerkClient, verifyToken } from "@clerk/express";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import { Server as SocketIOServer } from "socket.io";
import Session from "./models/Session.js";
import User from "./models/User.js";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest } from "./lib/inngestClient.js";
import { functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import problemRoutes from "./routes/problemRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import executeRoutes from "./routes/executeRoute.js";
import aiPracticeRoutes from "./routes/aiPracticeRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();
const server = http.createServer(app);

const __dirname = path.resolve();

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for SPA — CSP handled by frontend
  crossOriginEmbedderPolicy: false, // Required for Stream.io video embeds
}));
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

// ─── Global Rate Limiter: 100 requests/min per IP ───────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
  skip: (req) => req.path === "/health" || req.path.startsWith("/api/inngest"),
});
app.use(globalLimiter);

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/ai-practice", aiPracticeRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

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

// ─── Socket.io Server (Real-time Events) ────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Socket.io Authentication Middleware ─────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify the Clerk session token
    const { sub: clerkId } = await verifyToken(token, {
      secretKey: ENV.CLERK_SECRET_KEY,
    });
    if (!clerkId) {
      return next(new Error("Invalid token"));
    }

    // Attach user info to socket for later use
    socket.clerkId = clerkId;
    next();
  } catch (err) {
    console.error("[Socket.io] Auth failed:", err.message);
    next(new Error("Authentication failed"));
  }
});

// Store io on Express app so controllers can broadcast events
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket.io] Authenticated client connected: ${socket.id} (${socket.clerkId})`);

  socket.on("join:session", (sessionId) => {
    socket.join(sessionId);
    console.log(`[Socket.io] ${socket.id} joined room: ${sessionId}`);
  });

  // Inbox: user joins their own personal room only
  socket.on("join:inbox", (userId) => {
    // Security: only allow joining your own inbox
    if (userId !== socket.clerkId) {
      console.warn(`[Socket.io] ${socket.id} tried to join someone else's inbox: ${userId}`);
      return;
    }
    socket.join(`inbox:${userId}`);
    console.log(`[Socket.io] ${socket.id} joined inbox room: inbox:${userId}`);
  });

  socket.on("cheat:detected", async (payload) => {
    const { sessionId, userId, type, timestamp } = payload;
    console.log(`[Socket.io] Cheat detected — session: ${sessionId}, user: ${userId}, type: ${type}`);

    try {
      // Count existing violations of this type for this user in the session
      const session = await Session.findById(sessionId);
      const existingCount = session?.violations?.filter(
        (v) => v.userId === userId && v.type === type
      ).length || 0;

      await Session.findByIdAndUpdate(sessionId, {
        $push: {
          violations: {
            userId,
            type,
            timestamp: timestamp || new Date(),
            count: existingCount + 1,
          },
        },
      });

      // Broadcast to all clients in the session room (interviewer gets the alert)
      io.to(sessionId).emit("violation:alert", {
        userId,
        type,
        timestamp: timestamp || new Date(),
        totalCount: existingCount + 1,
      });
    } catch (err) {
      console.error("[Socket.io] Error saving violation:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─── Production static files ─────────────────────────────────────
// NOTE: Static file serving is disabled because the frontend is deployed
// separately on Vercel. If you ever want to serve both from one server,
// uncomment the block below and run `npm run build` in the frontend folder.
//
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));
//   app.get("/{*any}", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

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
