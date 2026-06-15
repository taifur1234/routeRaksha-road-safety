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
  const session = readJson(SESSION_KEY, null) || readJson(`${SESSION_KEY}Temp`, null);
  return session?.token || "";
}

export { getAuthToken };
