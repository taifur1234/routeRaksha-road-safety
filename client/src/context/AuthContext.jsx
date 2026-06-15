import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, hasFirebaseConfig } from "../config/firebase";

const AuthContext = createContext(null);
const SESSION_KEY = "routeRakshaSession";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const POPUP_BLOCKED_CODES = new Set([
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
  "auth/popup-blocked",
]);

function googleAuthMessage(error) {
  if (error?.code === "auth/popup-closed-by-user") {
    return "Google login was cancelled. Please try again when you are ready.";
  }

  return error?.message || "Google login failed. Please try again.";
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readSessionJson(key, fallback) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readSession() {
  return readJson(SESSION_KEY, null) || readSessionJson(`${SESSION_KEY}Temp`, null);
}

function writeSession(user, remember = true) {
  localStorage.removeItem(`${SESSION_KEY}Temp`);
  sessionStorage.removeItem(`${SESSION_KEY}Temp`);

  if (remember) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.setItem(`${SESSION_KEY}Temp`, JSON.stringify(user));
}

function updateStoredSession(user) {
  const existingLocal = readJson(SESSION_KEY, null);
  const existingTemp = readSessionJson(`${SESSION_KEY}Temp`, null);
  const nextUser = {
    ...(existingLocal || existingTemp || {}),
    ...user,
  };

  if (existingLocal) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    return nextUser;
  }

  if (existingTemp) {
    sessionStorage.setItem(`${SESSION_KEY}Temp`, JSON.stringify(nextUser));
    return nextUser;
  }

  return nextUser;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  const requestAuth = useCallback(async function requestAuth(path, body) {
    try {
      const response = await fetch(`${API_URL}/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || "Authentication failed." };
      }

      return data;
    } catch {
      return { ok: false, message: "Server is not reachable. Please try again." };
    }
  }, []);

  const requestAccount = useCallback(async function requestAccount(path, options = {}) {
    const session = readSession();

    try {
      const response = await fetch(`${API_URL}/api/auth/${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token || ""}`,
          ...(options.headers || {}),
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { ok: false, message: data.message || "Account request failed." };
      }

      return data;
    } catch {
      return { ok: false, message: "Server is not reachable. Please try again." };
    }
  }, []);

  const signup = useCallback(async function signup({ name, email, password }) {
    const result = await requestAuth("signup", { name, email, password });

    if (!result.ok) {
      return result;
    }

    writeSession(result.user, true);
    setUser(result.user);

    return { ok: true };
  }, [requestAuth]);

  const login = useCallback(async function login({ email, password, remember = true }) {
    const result = await requestAuth("login", { email, password });

    if (!result.ok) {
      return result;
    }

    writeSession(result.user, remember);
    setUser(result.user);

    return {
      ok: true,
      redirectTo: result.user?.role === "admin" ? "/admin" : undefined,
    };
  }, [requestAuth]);

  const finishGoogleLogin = useCallback(async function finishGoogleLogin(firebaseUser) {
    const backendResult = await requestAuth("google", {
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.displayName || "RouteRaksha User",
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    });

    if (!backendResult.ok) {
      return backendResult;
    }

    writeSession(backendResult.user, true);
    setUser(backendResult.user);

    return {
      ok: true,
      redirectTo: backendResult.user?.role === "admin" ? "/admin" : undefined,
    };
  }, [requestAuth]);

  const loginWithGoogle = useCallback(async function loginWithGoogle() {
    if (!hasFirebaseConfig() || !auth) {
      return {
        ok: false,
        message: "Firebase config missing. Add Firebase web config values in client/.env.",
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return finishGoogleLogin(result.user);
    } catch (error) {
      if (POPUP_BLOCKED_CODES.has(error.code)) {
        await signInWithRedirect(auth, googleProvider);
        return { ok: true, redirecting: true };
      }

      return {
        ok: false,
        message: googleAuthMessage(error),
      };
    }
  }, [finishGoogleLogin]);

  useEffect(() => {
    if (!hasFirebaseConfig() || !auth) {
      return;
    }

    let isMounted = true;

    getRedirectResult(auth)
      .then((result) => {
        if (!result?.user || !isMounted) {
          return null;
        }

        return finishGoogleLogin(result.user);
      })
      .then((result) => {
        if (!result?.ok || !isMounted) {
          return;
        }

        window.location.replace(result.redirectTo || "/");
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, [finishGoogleLogin]);

  const logout = useCallback(function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(`${SESSION_KEY}Temp`);
    sessionStorage.removeItem(`${SESSION_KEY}Temp`);

    if (auth?.currentUser) {
      signOut(auth).catch(() => {});
    }

    setUser(null);
  }, []);

  const refreshProfile = useCallback(async function refreshProfile() {
    const result = await requestAccount("profile");

    if (!result.ok) {
      return result;
    }

    const nextUser = updateStoredSession(result.user);
    setUser(nextUser);

    return { ok: true, user: nextUser };
  }, [requestAccount]);

  const updateProfile = useCallback(async function updateProfile({ name, photoURL }) {
    const result = await requestAccount("profile", {
      method: "PATCH",
      body: JSON.stringify({ name, photoURL }),
    });

    if (!result.ok) {
      return result;
    }

    const nextUser = updateStoredSession(result.user);
    setUser(nextUser);

    return { ok: true, user: nextUser };
  }, [requestAccount]);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      signup,
      login,
      loginWithGoogle,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [login, loginWithGoogle, logout, refreshProfile, signup, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
