import express from "express";
import { googleLogin, login, signup } from "../controllers/authController.js";
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

export default router;
