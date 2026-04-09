import express from "express";
import { protectRoute, requireRole } from "../middleware/protectRoute.js";
import { validate, applyToJobSchema } from "../middleware/validateRequest.js";
import {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
  scheduleInterview,
  getApplicationById,
  sendOffer,
  respondToOffer,
  aiMatchResume,
} from "../controllers/applicationController.js";

const router = express.Router();

// ── Candidate routes ──────────────────────────────────────────
router.post("/", protectRoute, requireRole("candidate"), validate(applyToJobSchema), applyToJob);
router.get("/my", protectRoute, requireRole("candidate"), getMyApplications);
router.patch(
  "/:id/offer-response",
  protectRoute,
  requireRole("candidate"),
  respondToOffer
);

// ── Recruiter / Interviewer / Admin routes ────────────────────
router.get(
  "/job/:jobId",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  getApplicationsForJob
);
router.patch(
  "/:id/status",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  updateApplicationStatus
);
router.post(
  "/:id/schedule",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  scheduleInterview
);
router.post(
  "/:id/offer",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  sendOffer
);
router.post(
  "/:id/ai-match",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  aiMatchResume
);

// ── Both roles (auth but no specific role restriction) ────────
router.get("/:id", protectRoute, getApplicationById);

export default router;
