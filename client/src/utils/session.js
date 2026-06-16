const SESSION_KEY = "routeRakshaSession";

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getAuthToken() {
  return "";
}

function hasStoredSession() {
  return Boolean(readJson(SESSION_KEY, null) || readJson(`${SESSION_KEY}Temp`, null));
}

function authFetch(url, options = {}) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}

export { authFetch, getAuthToken, hasStoredSession };
