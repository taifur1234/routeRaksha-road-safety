import express from "express";
import { getLeaderboard, getMyReputation, grantAdminBonus } from "../controllers/reputationController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const reputationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Reputation requests are being used too quickly.",
  keyGenerator: userOrIpKey,
});
const adminBonusLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Admin reputation actions are being used too quickly.",
  keyGenerator: userOrIpKey,
});

router.get("/me", requireAuth, reputationLimiter, asyncHandler(getMyReputation));
router.get("/leaderboard", reputationLimiter, asyncHandler(getLeaderboard));
router.post("/users/:userId/bonus", requireAuth, requireAdmin, adminBonusLimiter, asyncHandler(grantAdminBonus));

export default router;
