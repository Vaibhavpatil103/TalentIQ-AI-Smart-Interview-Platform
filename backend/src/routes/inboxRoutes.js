import express from "express";
import rateLimit from "express-rate-limit";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getInbox,
  getUnreadCount,
  getMessage,
  sendMessage,
  replyToMessage,
} from "../controllers/inboxController.js";

const router = express.Router();

// Rate limiter for messaging: 20 messages per minute per IP
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many messages, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", protectRoute, getInbox);
router.get("/unread-count", protectRoute, getUnreadCount);
router.get("/:id", protectRoute, getMessage);
router.post("/", protectRoute, messageLimiter, sendMessage);
router.post("/:id/reply", protectRoute, messageLimiter, replyToMessage);

export default router;
