import express from "express";
import { protectRoute, requireRole } from "../middleware/protectRoute.js";
import { validate, updateProfileSchema } from "../middleware/validateRequest.js";
import {
  getProfile,
  updateProfile,
  getInterviewHistory,
  getAllUsers,
  updateUserRole,
  setRole,
} from "../controllers/userController.js";

const router = express.Router();

// Profile routes
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, validate(updateProfileSchema), updateProfile);
router.post("/set-role", protectRoute, setRole);
router.get("/history", protectRoute, getInterviewHistory);

// Admin routes
router.get("/", protectRoute, requireRole("admin"), getAllUsers);
router.put("/:id/role", protectRoute, requireRole("admin"), updateUserRole);

export default router;
