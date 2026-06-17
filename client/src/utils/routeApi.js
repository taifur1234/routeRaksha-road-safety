import { authFetch } from "./session";
import { API_URL } from "../config/api";

const CACHE_TTL = 30 * 1000;
const apiCache = new Map();
const emergencyCache = new Map();

async function requestApi(path, options = {}) {
  const method = options.method || "GET";
  const cacheKey = `${method}:${path}`;

  if (method === "GET") {
    const cached = apiCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return cached.data;
    }
  }

  const response = await authFetch(`${API_URL}${path}`, {
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Route service failed.");
  }

  if (method === "GET") {
    apiCache.set(cacheKey, { data, createdAt: Date.now() });
  } else {
    apiCache.clear();
  }

  return data;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

async function listSavedRoutes(params = {}) {
  const data = await requestApi(`/api/routes/saved${buildQuery(params)}`);
  return data;
}

async function saveRoute(route) {
  const data = await requestApi("/api/routes/saved", {
    method: "POST",
    body: JSON.stringify(route),
  });

  return data.route;
}

async function renameSavedRoute(id, routeName) {
  const data = await requestApi(`/api/routes/saved/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ routeName }),
  });

  return data.route;
}

async function deleteSavedRoute(id) {
  const data = await requestApi(`/api/routes/saved/${id}`, {
    method: "DELETE",
  });

  return data.route;
}

async function listRouteHistory(params = {}) {
  const data = await requestApi(`/api/routes/history${buildQuery(params)}`);
  return data;
}

async function recordRouteHistory(history) {
  const data = await requestApi("/api/routes/history", {
    method: "POST",
    body: JSON.stringify(history),
  });

  return data.history;
}

async function clearRouteHistory() {
  const data = await requestApi("/api/routes/history", {
    method: "DELETE",
  });

  return data.deletedCount || 0;
}

async function findEmergencyServices(payload) {
  const safePayload = payload || {};
  const routePoints = Array.isArray(safePayload.routePoints) ? safePayload.routePoints : [];
  const cacheKey = JSON.stringify({
    types: safePayload.types || [],
    radiusMeters: safePayload.radiusMeters || 5000,
    routePoints: routePoints.filter((_, index) => index % 12 === 0),
  });
  const cached = emergencyCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < 5 * 60 * 1000) {
    return cached.data;
  }

  const data = await requestApi("/api/emergency-services/nearby", {
    method: "POST",
    body: JSON.stringify(safePayload),
  });

  emergencyCache.set(cacheKey, { data, createdAt: Date.now() });
  return data;
}

export {
  clearRouteHistory,
  deleteSavedRoute,
  findEmergencyServices,
  listRouteHistory,
  listSavedRoutes,
  recordRouteHistory,
  renameSavedRoute,
  saveRoute,
};
