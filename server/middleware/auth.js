import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);

  if (!payload?.id) {
    return res.status(401).json({ ok: false, message: "Login required." });
  }

  const user = await User.findById(payload.id).select("name email role");

  if (!user) {
    return res.status(401).json({ ok: false, message: "User not found." });
  }

  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Admin access required." });
  }

  return next();
}

export { requireAuth, requireAdmin };
