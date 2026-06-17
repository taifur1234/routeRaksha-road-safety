const LOCAL_API_URL = "http://localhost:5000";

function stripTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function pointsToLocalhost(url) {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

function getApiBaseUrl() {
  const configuredUrl = stripTrailingSlash(import.meta.env.VITE_API_URL);

  if (typeof window === "undefined") {
    return configuredUrl || LOCAL_API_URL;
  }

  const isLocalApp = isLocalHostname(window.location.hostname);

  if (configuredUrl && (isLocalApp || !pointsToLocalhost(configuredUrl))) {
    return configuredUrl;
  }

  if (isLocalApp) {
    return LOCAL_API_URL;
  }

  return "";
}

const API_URL = getApiBaseUrl();

function buildApiUrl(path) {
  const pathText = String(path || "");
  const normalizedPath = pathText.startsWith("/") ? pathText : `/${pathText}`;
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

function createApiUrl(path) {
  const baseUrl = typeof window === "undefined" ? LOCAL_API_URL : window.location.origin;
  return new URL(buildApiUrl(path), baseUrl);
}

export { API_URL, buildApiUrl, createApiUrl, getApiBaseUrl };
