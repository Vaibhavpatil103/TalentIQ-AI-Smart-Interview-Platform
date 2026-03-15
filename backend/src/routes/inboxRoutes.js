import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getInbox,
  getUnreadCount,
  getMessage,
  sendMessage,
  replyToMessage,
} from "../controllers/inboxController.js";

const router = express.Router();

router.get("/", protectRoute, getInbox);
router.get("/unread-count", protectRoute, getUnreadCount);
router.get("/:id", protectRoute, getMessage);
router.post("/", protectRoute, sendMessage);
router.post("/:id/reply", protectRoute, replyToMessage);

export default router;
