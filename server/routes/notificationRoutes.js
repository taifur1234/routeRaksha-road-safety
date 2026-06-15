import express from "express";
import {
  adminBroadcast,
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const notificationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 80,
  message: "Notification requests are being used too quickly.",
  keyGenerator: userOrIpKey,
});
const broadcastLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 8,
  message: "Notification broadcasts are being sent too quickly.",
  keyGenerator: userOrIpKey,
});

router.use(requireAuth);
router.get("/", notificationLimiter, asyncHandler(listNotifications));
router.get("/unread-count", notificationLimiter, asyncHandler(getUnreadCount));
router.patch("/read-all", notificationLimiter, asyncHandler(markAllNotificationsRead));
router.patch("/:id/read", notificationLimiter, asyncHandler(markNotificationRead));
router.delete("/:id", notificationLimiter, asyncHandler(deleteNotification));
router.post("/broadcast", requireAdmin, broadcastLimiter, asyncHandler(adminBroadcast));

export default router;
