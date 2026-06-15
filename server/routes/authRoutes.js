import express from "express";
import { getProfile, googleLogin, login, signup, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many login attempts. Please wait 15 minutes and try again.",
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;
