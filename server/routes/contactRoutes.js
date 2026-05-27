import express from "express";
import { createContactMessage } from "../controllers/contactController.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many contact messages. Please wait before sending another message.",
  keyGenerator: userOrIpKey,
});

router.post("/", requireAuth, contactLimiter, createContactMessage);

export default router;
