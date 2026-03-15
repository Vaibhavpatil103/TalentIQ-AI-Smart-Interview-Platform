import express from "express";
import { protectRoute, requireRole } from "../middleware/protectRoute.js";
import { validate, createFeedbackSchema } from "../middleware/validateRequest.js";
import {
  createFeedback,
  getFeedbackBySession,
  getFeedbackByCandidate,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", protectRoute, validate(createFeedbackSchema), createFeedback);
router.get("/session/:sessionId", protectRoute, getFeedbackBySession);
router.get("/candidate/:candidateId", protectRoute, getFeedbackByCandidate);

export default router;
