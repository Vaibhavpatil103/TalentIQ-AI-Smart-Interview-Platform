import express from "express";
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

router.post("/start", protectRoute, uploadResume.single("resume"), startSession);
router.post("/respond", protectRoute, respondToAnswer);
router.post("/end", protectRoute, endSession);
router.get("/sessions", protectRoute, getSessions);
router.get("/sessions/:id", protectRoute, getSessionById);

export default router;
