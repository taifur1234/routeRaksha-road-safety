const SESSION_KEY = "routeRakshaSession";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CACHE_TTL = 45 * 1000;
const reportCache = new Map();

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getAuthToken() {
  const session =
    readJson(SESSION_KEY, null) ||
    readJson(`${SESSION_KEY}Temp`, null);

  return session?.token || "";
}

async function requestReports(path = "", options = {}) {
  const token = getAuthToken();
  const method = options.method || "GET";
  const cacheKey = `${method}:${path}:${token}`;

  if (method === "GET") {
    const cached = reportCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return cached.data;
    }
  }

  const response = await fetch(`${API_URL}/api/reports${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Report service failed.");
  }

  if (method === "GET") {
    reportCache.set(cacheKey, { data, createdAt: Date.now() });
  } else {
    reportCache.clear();
  }

  return data;
}

async function readAccidentReports() {
  const data = await requestReports();
  return data.reports || [];
}

async function readApprovedAccidentReports() {
  const data = await requestReports("/approved");
  return data.reports || [];
}

async function ensureAccidentReports() {
  return readAccidentReports();
}

async function saveAccidentReport(report) {
  const data = await requestReports("", {
    method: "POST",
    body: JSON.stringify(report),
  });

  return data.report;
}

async function updateAccidentReportStatus(id, status) {
  const data = await requestReports(`/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return data.report;
}

async function updateAccidentReport(id, updates) {
  const data = await requestReports(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return data.report;
}

async function deleteAccidentReport(id) {
  const data = await requestReports(`/${id}`, {
    method: "DELETE",
  });

  return data.report;
}

export {
  deleteAccidentReport,
  ensureAccidentReports,
  readAccidentReports,
  readApprovedAccidentReports,
  saveAccidentReport,
  updateAccidentReport,
  updateAccidentReportStatus,
};
