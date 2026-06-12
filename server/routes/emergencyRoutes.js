import express from "express";
import { findNearbyEmergencyServices } from "../controllers/emergencyController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const emergencyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "Emergency service lookups are being used too quickly. Please slow down.",
  keyGenerator: userOrIpKey,
});

router.post("/nearby", requireAuth, emergencyLimiter, asyncHandler(findNearbyEmergencyServices));

export default router;
