import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";
import { cleanText, isStrongPassword, isValidEmail, isValidImageData } from "../utils/validation.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sendAuthResponse(res, user) {
  const sessionUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    photoURL: user.photoURL,
    hasPassword: Boolean(user.passwordHash),
    token: signToken({ id: user._id, email: user.email, role: user.role }),
  };

  return res.json({ ok: true, user: sessionUser });
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

  return sendAuthResponse(res, user);
}

async function login(req, res) {
  const { email, password } = req.body;
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

  return sendAuthResponse(res, user);
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
    user.photoURL = cleanText(photoURL, 500) || user.photoURL;
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
  }

  return sendAuthResponse(res, user);
}

async function getProfile(req, res) {
  return res.json({ ok: true, user: serializeSessionUser(req.user) });
}

async function updateProfile(req, res) {
  const cleanName = cleanText(req.body.name, 60);
  const photoURL = String(req.body.photoURL || "").trim();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return res.status(400).json({ ok: false, message: "Name must be between 2 and 60 characters." });
  }

  if (!isValidProfilePhoto(photoURL)) {
    return res.status(400).json({ ok: false, message: "Profile photo must be a valid image file." });
  }

  req.user.name = cleanName;
  req.user.photoURL = photoURL;
  await req.user.save();

  return res.json({ ok: true, user: serializeSessionUser(req.user) });
}

export { signup, login, googleLogin, getProfile, updateProfile, ensureAdminUser };
