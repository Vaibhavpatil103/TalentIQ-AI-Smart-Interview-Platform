import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getProgress,
  completeDailyChallenge,
  getCompanyTracks,
  startCompanyTrack,
} from "../controllers/gamificationController.js";

const router = express.Router();

router.get("/progress", protectRoute, getProgress);
router.post("/daily-complete", protectRoute, completeDailyChallenge);
router.get("/tracks", protectRoute, getCompanyTracks);
router.post("/tracks/:company", protectRoute, startCompanyTrack);

export default router;
