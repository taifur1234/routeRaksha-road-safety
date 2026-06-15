import Notification from "../models/Notification.js";
import { broadcastNotification, normalizeNotification } from "../services/notificationService.js";
import { cleanSearch, cleanText, getPagination, isValidObjectId } from "../utils/validation.js";
import { emitToUser } from "../services/socketService.js";

async function listNotifications(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 12, maxLimit: 50 });
  const search = cleanSearch(req.query.search, 80);
  const filter = { userId: req.user._id };

  if (req.query.type) {
    filter.type = cleanText(req.query.type, 40);
  }

  if (req.query.read === "true") {
    filter.isRead = true;
  }

  if (req.query.read === "false") {
    filter.isRead = false;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ title: regex }, { message: regex }, { type: regex }];
  }

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  return res.json({
    ok: true,
    notifications: items.map(normalizeNotification),
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function getUnreadCount(req, res) {
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  return res.json({ ok: true, unreadCount });
}

async function markNotificationRead(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid notification id." });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { isRead: true } },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ ok: false, message: "Notification not found." });
  }

  const normalized = normalizeNotification(notification);
  emitToUser(req.user._id, "notification:read", normalized);
  return res.json({ ok: true, notification: normalized });
}

async function markAllNotificationsRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
  emitToUser(req.user._id, "notification:read", { all: true });
  return res.json({ ok: true });
}

async function deleteNotification(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid notification id." });
  }

  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!notification) {
    return res.status(404).json({ ok: false, message: "Notification not found." });
  }

  emitToUser(req.user._id, "notification:delete", { id: notification._id });
  return res.json({ ok: true, notification: normalizeNotification(notification) });
}

async function adminBroadcast(req, res) {
  const mode = req.body.mode === "all" ? "all" : "selected";
  const userIds = Array.isArray(req.body.userIds)
    ? req.body.userIds.filter(isValidObjectId).slice(0, 250)
    : [];

  if (mode !== "all" && !userIds.length) {
    return res.status(400).json({ ok: false, message: "Choose at least one user." });
  }

  const result = await broadcastNotification({
    mode,
    userIds,
    title: req.body.title,
    message: req.body.message,
    type: "ADMIN",
    metadata: { sentBy: req.user._id },
  });

  return res.status(201).json({ ok: true, ...result });
}

export {
  adminBroadcast,
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
};
