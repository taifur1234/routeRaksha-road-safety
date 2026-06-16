import express from "express";
import { getProfile, googleLogin, login, logout, signup, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { uploadProfilePhoto } from "../middleware/upload.js";

const router = express.Router();
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many login attempts. Please wait 15 minutes and try again.",
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);
router.post("/logout", logout);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, uploadProfilePhoto, updateProfile);

export default router;
