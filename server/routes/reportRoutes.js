import express from "express";
import {
  createReport,
  deleteReport,
  listApprovedReports,
  listReports,
  updateReport,
  updateReportStatus,
} from "../controllers/reportController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const reportCreateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: "Too many report submissions. Please wait before submitting another report.",
  keyGenerator: userOrIpKey,
});

router.get("/", requireAuth, listReports);
router.get("/approved", requireAuth, listApprovedReports);
router.post("/", requireAuth, reportCreateLimiter, createReport);
router.patch("/:id", requireAuth, requireAdmin, updateReport);
router.patch("/:id/status", requireAuth, requireAdmin, updateReportStatus);
router.delete("/:id", requireAuth, requireAdmin, deleteReport);

export default router;
