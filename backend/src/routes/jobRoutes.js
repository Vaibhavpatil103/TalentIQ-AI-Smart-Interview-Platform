import express from "express";
import { protectRoute, requireRole } from "../middleware/protectRoute.js";
import { validate, createJobSchema } from "../middleware/validateRequest.js";
import {
  createJob,
  getMyJobs,
  getAllPublishedJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  getJobStats,
} from "../controllers/jobController.js";

const router = express.Router();

// ── Public (no auth) ─────────────────────────────────────────
router.get("/published", getAllPublishedJobs);

// ── Recruiter / Interviewer / Admin ──────────────────────────
// NOTE: /stats/overview must come before /:id to avoid being
//       captured as a dynamic segment.
router.get(
  "/stats/overview",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  getJobStats
);
router.get(
  "/",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  getMyJobs
);
router.post(
  "/",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  validate(createJobSchema),
  createJob
);
router.put(
  "/:id",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  updateJob
);
router.delete(
  "/:id",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  deleteJob
);
router.patch(
  "/:id/publish",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  publishJob
);
router.patch(
  "/:id/close",
  protectRoute,
  requireRole("interviewer", "recruiter", "admin"),
  closeJob
);

// ── Public with id param (must be after specific routes) ─────
router.get("/:id", getJobById);

export default router;
