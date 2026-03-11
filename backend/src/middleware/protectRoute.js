import { clerkClient, requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // Auto-create user if they exist in Clerk but not in our DB
      if (!user) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
          const profileImage = clerkUser.imageUrl;

          // Try to find by email and update clerkId (handles existing users)
          user = await User.findOneAndUpdate(
            { email },
            { clerkId, name, profileImage },
            { new: true }
          );

          if (!user) {
            // Truly new user — create from scratch
            user = await User.create({ clerkId, email, name, profileImage });
          }

          // Also sync to Stream
          await upsertStreamUser({
            id: clerkId,
            name: user.name,
            image: user.profileImage,
          });

          console.log("Auto-synced user from Clerk:", user.email);
        } catch (clerkError) {
          console.error("Failed to auto-create user:", clerkError.message);
          return res.status(404).json({ message: "User not found" });
        }
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

// Role-based access control middleware
// Usage: router.post('/problems', protectRoute, requireRole('interviewer', 'admin'), createProblem);
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

