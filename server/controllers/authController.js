import User from "../models/User.js";
import { deleteCloudinaryImage, uploadImageBuffer } from "../services/cloudinaryService.js";
import { createNotification } from "../services/notificationService.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";
import { cleanText, isStrongPassword, isValidEmail, isValidImageData } from "../utils/validation.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

const AUTH_COOKIE_NAME = "routeRakshaToken";

function authCookieOptions(remember = true) {
  const maxAge = Number(process.env.JWT_EXPIRES_SECONDS || 7 * 24 * 60 * 60) * 1000;
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");
  const secure = isProduction || process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
    ...(remember ? { maxAge } : {}),
  };
}

function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");
  const secure = isProduction || process.env.COOKIE_SECURE === "true";

  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
  });
}

function sendAuthResponse(res, user, { remember = true } = {}) {
  const token = signToken({ id: user._id, email: user.email, role: user.role });
  const sessionUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    photoURL: user.photoURL,
    hasPassword: Boolean(user.passwordHash),
  };

  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(remember));
  return res.json({ ok: true, user: sessionUser, token });
}

function serializeSessionUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    photoURL: user.photoURL,
    hasPassword: Boolean(user.passwordHash),
  };
}

function isValidProfilePhoto(value) {
  if (!value) {
    return true;
  }

  const photoURL = String(value).trim();

  return (photoURL.length <= 500 && /^https?:\/\/[^\s<>]+$/i.test(photoURL)) || isValidImageData(photoURL, 450_000);
}

async function sendWelcomeNotification(user) {
  if (!user?._id) {
    return;
  }

  await createNotification({
    userId: user._id,
    title: "Welcome to RouteRaksha",
    message: "Your account is ready. You can now check safer routes, report risky spots, and track your safety updates.",
    type: "SYSTEM",
    metadata: { kind: "welcome" },
  });
}

async function ensureAdminUser() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "admin@routeraksha.local");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }
    return existingAdmin;
  }

  return User.create({
    name: "RouteRaksha Admin",
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: "admin",
    provider: "local",
  });
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  const cleanName = cleanText(name, 60);
  const normalizedEmail = normalizeEmail(email);

  if (!cleanName || !normalizedEmail || !password) {
    return res.status(400).json({ ok: false, message: "Name, email and password are required." });
  }

  if (cleanName.length < 2 || cleanName.length > 60) {
    return res.status(400).json({ ok: false, message: "Name must be between 2 and 60 characters." });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      ok: false,
      message: "Password must be 8-128 characters and include at least one letter and one number.",
    });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ ok: false, message: "Account already exists. Please login." });
  }

  const user = await User.create({
    name: cleanName,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    provider: "local",
  });
  await sendWelcomeNotification(user).catch(() => {});

  return sendAuthResponse(res, user);
}

async function login(req, res) {
  const { email, password, remember } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required." });
  }

  if (!isValidEmail(normalizedEmail) || String(password).length > 128) {
    return res.status(401).json({ ok: false, message: "Invalid email or password." });
  }

  await ensureAdminUser();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ ok: false, message: "Invalid email or password." });
  }

  return sendAuthResponse(res, user, { remember: Boolean(remember) });
}

async function googleLogin(req, res) {
  const { name, email, photoURL, firebaseUid } = req.body;
  const cleanName = cleanText(name, 60) || "RouteRaksha User";
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !firebaseUid || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ ok: false, message: "Google account details are required." });
  }

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.name = cleanName || user.name;
    user.photoURL = user.photoURL || cleanText(photoURL, 500) || "";
    user.firebaseUid = cleanText(firebaseUid, 160);
    user.provider = user.provider === "local" ? "local" : "google";
    await user.save();
  } else {
    user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      photoURL: cleanText(photoURL, 500) || "",
      firebaseUid: cleanText(firebaseUid, 160),
      provider: "google",
    });
    await sendWelcomeNotification(user).catch(() => {});
  }

  return sendAuthResponse(res, user);
}

async function getProfile(req, res) {
  return res.json({ ok: true, user: serializeSessionUser(req.user) });
}

async function updateProfile(req, res) {
  const cleanName = cleanText(req.body.name, 60);
  const photoURL = String(req.body.photoURL || "").trim();
  const removePhoto = req.body.removePhoto === true || req.body.removePhoto === "true";
  const hasPhotoURLInput = Object.prototype.hasOwnProperty.call(req.body, "photoURL");

  if (cleanName.length < 2 || cleanName.length > 60) {
    return res.status(400).json({ ok: false, message: "Name must be between 2 and 60 characters." });
  }

  if (!req.file && !removePhoto && hasPhotoURLInput && !isValidProfilePhoto(photoURL)) {
    return res.status(400).json({ ok: false, message: "Profile photo must be a valid image file." });
  }

  const updates = { name: cleanName };
  let previousPublicId = "";

  if (req.file) {
    const uploaded = await uploadImageBuffer(req.file, "route-raksha/profile-photos");
    previousPublicId = req.user.photoPublicId;
    updates.photoURL = uploaded.url;
    updates.photoPublicId = uploaded.publicId;
  } else if (removePhoto || (hasPhotoURLInput && photoURL === "")) {
    previousPublicId = req.user.photoPublicId;
    updates.photoURL = "";
    updates.photoPublicId = "";
  } else if (hasPhotoURLInput) {
    updates.photoURL = photoURL;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).select("name email role provider photoURL passwordHash");

  if (!updatedUser) {
    return res.status(404).json({ ok: false, message: "User not found." });
  }

  await deleteCloudinaryImage(previousPublicId);

  return res.json({ ok: true, user: serializeSessionUser(updatedUser) });
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

export { signup, login, googleLogin, getProfile, updateProfile, logout, ensureAdminUser };
