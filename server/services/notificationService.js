import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { cleanText } from "../utils/validation.js";
import { emitToUser } from "./socketService.js";

const NOTIFICATION_TYPES = new Set([
  "REPORT_APPROVED",
  "REPORT_REJECTED",
  "NEW_BLACKSPOT_NEAR_ROUTE",
  "SAFETY_ALERT",
  "SYSTEM",
  "ACHIEVEMENT",
  "ADMIN",
]);

function normalizeNotification(notification) {
  return {
    id: notification._id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    metadata: notification.metadata || {},
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

async function createNotification({ userId, title, message, type = "SYSTEM", metadata = {} }) {
  if (!userId) {
    return null;
  }

  const notification = await Notification.create({
    userId,
    title: cleanText(title, 120),
    message: cleanText(message, 600),
    type: NOTIFICATION_TYPES.has(type) ? type : "SYSTEM",
    metadata,
  });
  const normalized = normalizeNotification(notification);

  emitToUser(userId, "notification:new", normalized);
  return normalized;
}

async function broadcastNotification({ mode, userIds = [], title, message, type = "ADMIN", metadata = {} }) {
  const cleanTitle = cleanText(title, 120);
  const cleanMessage = cleanText(message, 600);

  if (!cleanTitle || !cleanMessage) {
    const error = new Error("Title and message are required.");
    error.statusCode = 400;
    throw error;
  }

  const filter = mode === "all" ? {} : { _id: { $in: userIds } };
  const users = await User.find(filter).select("_id").limit(mode === "all" ? 5000 : 250);
  const docs = users.map((user) => ({
    userId: user._id,
    title: cleanTitle,
    message: cleanMessage,
    type: NOTIFICATION_TYPES.has(type) ? type : "ADMIN",
    metadata,
  }));

  if (!docs.length) {
    return { createdCount: 0 };
  }

  const result = await Notification.insertMany(docs, { ordered: false });

  result.forEach((notification) => {
    emitToUser(notification.userId, "notification:new", normalizeNotification(notification));
  });

  return { createdCount: result.length };
}

export { NOTIFICATION_TYPES, broadcastNotification, createNotification, normalizeNotification };
