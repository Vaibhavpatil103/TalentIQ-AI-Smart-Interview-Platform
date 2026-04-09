import express from "express";
import rateLimit from "express-rate-limit";
import { protectRoute } from "../middleware/protectRoute.js";
import uploadResume from "../middleware/uploadResume.js";
import {
  startSession,
  respondToAnswer,
  endSession,
  getSessions,
  getSessionById,
} from "../controllers/aiPracticeController.js";

const router = express.Router();

// Strict rate limiter for AI endpoints: 10 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many AI requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/start", protectRoute, aiLimiter, uploadResume.single("resume"), startSession);
router.post("/respond", protectRoute, aiLimiter, respondToAnswer);
router.post("/end", protectRoute, aiLimiter, endSession);
router.get("/sessions", protectRoute, getSessions);
router.get("/sessions/:id", protectRoute, getSessionById);

export default router;
