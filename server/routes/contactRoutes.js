import express from "express";
import {
  createContactMessage,
  deleteContactMessage,
  listContactMessages,
  markContactMessageSeen,
} from "../controllers/contactController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many contact messages. Please wait before sending another message.",
  keyGenerator: userOrIpKey,
});

router.use(requireAuth);
router.get("/messages", requireAdmin, asyncHandler(listContactMessages));
router.patch("/messages/:id/seen", requireAdmin, asyncHandler(markContactMessageSeen));
router.delete("/messages/:id", requireAdmin, asyncHandler(deleteContactMessage));
router.post("/", contactLimiter, asyncHandler(createContactMessage));

export default router;
