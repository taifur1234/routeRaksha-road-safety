import { authFetch } from "./session";
import { API_URL } from "../config/api";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString() ? `?${query.toString()}` : "";
}

async function requestContactMessages(path, options = {}) {
  const response = await authFetch(`${API_URL}/api/contact${path}`, {
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Contact message request failed.");
  }

  return data;
}

function listContactMessages(params = {}) {
  return requestContactMessages(`/messages${buildQuery(params)}`);
}

async function markContactMessageSeen(id) {
  const data = await requestContactMessages(`/messages/${id}/seen`, { method: "PATCH" });
  return data.message;
}

async function deleteContactMessage(id) {
  const data = await requestContactMessages(`/messages/${id}`, { method: "DELETE" });
  return data.message;
}

export { deleteContactMessage, listContactMessages, markContactMessageSeen };
