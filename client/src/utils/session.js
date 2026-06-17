const SESSION_KEY = "routeRakshaSession";
const AUTH_INVALID_EVENT = "route-raksha-auth-invalid";

let authInvalidated = false;

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

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(`${SESSION_KEY}Temp`);
  sessionStorage.removeItem(`${SESSION_KEY}Temp`);
}

function hasStoredSession() {
  return Boolean(readJson(SESSION_KEY, null) || readJson(`${SESSION_KEY}Temp`, null));
}

function isAuthInvalidated() {
  return authInvalidated || !hasStoredSession();
}

function markAuthInvalid() {
  if (authInvalidated) {
    return;
  }

  authInvalidated = true;
  clearStoredSession();
  window.dispatchEvent(new CustomEvent(AUTH_INVALID_EVENT));
}

function markAuthValid() {
  authInvalidated = false;
}

class AuthRequiredError extends Error {
  constructor(message = "Login required.") {
    super(message);
    this.name = "AuthRequiredError";
    this.status = 401;
  }
}

async function authFetch(url, options = {}) {
  if (authInvalidated && !options.allowAfterAuthInvalidation) {
    throw new AuthRequiredError();
  }

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    markAuthInvalid();
  } else if (response.ok) {
    markAuthValid();
  }

  return response;
}

export {
  AUTH_INVALID_EVENT,
  AuthRequiredError,
  authFetch,
  clearStoredSession,
  getAuthToken,
  hasStoredSession,
  isAuthInvalidated,
  markAuthValid,
};
