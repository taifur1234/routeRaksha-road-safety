import { authFetch } from "./session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CACHE_TTL = 45 * 1000;
const reportCache = new Map();

async function requestReports(path = "", options = {}) {
  const method = options.method || "GET";
  const cacheKey = `${method}:${path}`;

  if (method === "GET") {
    const cached = reportCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return cached.data;
    }
  }

  const response = await authFetch(`${API_URL}/api/reports${path}`, {
    ...options,
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
  const hasImageFile = typeof File !== "undefined" && report.imageFile instanceof File;
  const body = hasImageFile ? new FormData() : JSON.stringify(report);

  if (hasImageFile) {
    Object.entries(report).forEach(([key, value]) => {
      if (key === "imageFile" || value === undefined || value === null) {
        return;
      }

      body.set(key, String(value));
    });
    body.set("image", report.imageFile);
  }

  const data = await requestReports("", {
    method: "POST",
    body,
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
