import express from "express";
import rateLimit from "express-rate-limit";
import { protectRoute } from "../middleware/protectRoute.js";
import { validate, createSessionSchema } from "../middleware/validateRequest.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  getScheduledSessions,
  joinSessionByCode,
  pushProblem,
  approveParticipant,
  rejectParticipant,
} from "../controllers/sessionController.js";

const router = express.Router();

// Rate limiter for join-by-code endpoint: 10 requests per minute per IP
const joinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many join attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route (no auth required) — join by code
router.post("/join", protectRoute, joinLimiter, joinSessionByCode);

router.post("/", protectRoute, validate(createSessionSchema), createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);
router.get("/scheduled", protectRoute, getScheduledSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/:id/approve", protectRoute, approveParticipant);
router.post("/:id/reject", protectRoute, rejectParticipant);
router.patch("/:id/problem", protectRoute, pushProblem);

export default router;
