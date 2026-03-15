import express from "express";
import { protectRoute, requireRole } from "../middleware/protectRoute.js";
import upload from "../middleware/upload.js";
import { validate, createProblemSchema, updateProblemSchema } from "../middleware/validateRequest.js";
import {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  importProblems,
} from "../controllers/problemController.js";

const router = express.Router();

// Public routes
router.get("/", getAllProblems);
router.get("/:id", getProblemById);

// Import from Excel — admin only (must be BEFORE /:id routes)
router.post(
  "/import",
  protectRoute,
  requireRole("admin"),
  upload.single("file"),
  importProblems
);

// Protected routes — interviewers and admins only
router.post("/", protectRoute, requireRole("interviewer", "admin"), validate(createProblemSchema), createProblem);
router.put("/:id", protectRoute, requireRole("interviewer", "admin"), validate(updateProblemSchema), updateProblem);
router.delete("/:id", protectRoute, requireRole("admin"), deleteProblem);

export default router;
