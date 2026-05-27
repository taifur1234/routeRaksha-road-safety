import express from "express";
import { sendChatMessage } from "../controllers/chatController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
const chatLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 25,
  message: "Chat is receiving too many requests. Please wait a bit and try again.",
});

router.post("/", chatLimiter, sendChatMessage);

export default router;
