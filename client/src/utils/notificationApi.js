import { getAuthToken } from "./session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString() ? `?${query.toString()}` : "";
}

async function requestNotifications(path, options = {}) {
  const response = await fetch(`${API_URL}/api/notifications${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Notification service failed.");
  }

  return data;
}

function getSocketUrl() {
  return API_URL;
}

async function listNotifications(params = {}) {
  return requestNotifications(`/${buildQuery(params)}`);
}

async function getUnreadCount() {
  const data = await requestNotifications("/unread-count");
  return data.unreadCount || 0;
}

async function markNotificationRead(id) {
  const data = await requestNotifications(`/${id}/read`, { method: "PATCH" });
  return data.notification;
}

async function markAllNotificationsRead() {
  return requestNotifications("/read-all", { method: "PATCH" });
}

async function deleteNotification(id) {
  const data = await requestNotifications(`/${id}`, { method: "DELETE" });
  return data.notification;
}

async function broadcastNotification(payload) {
  return requestNotifications("/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export {
  broadcastNotification,
  deleteNotification,
  getSocketUrl,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
};
