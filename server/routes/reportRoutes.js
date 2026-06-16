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
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";
import { uploadReportImage } from "../middleware/upload.js";

const router = express.Router();
const reportCreateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: "Too many report submissions. Please wait before submitting another report.",
  keyGenerator: userOrIpKey,
});

router.get("/", requireAuth, asyncHandler(listReports));
router.get("/approved", requireAuth, asyncHandler(listApprovedReports));
router.post("/", requireAuth, reportCreateLimiter, uploadReportImage, asyncHandler(createReport));
router.patch("/:id", requireAuth, requireAdmin, asyncHandler(updateReport));
router.patch("/:id/status", requireAuth, requireAdmin, asyncHandler(updateReportStatus));
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(deleteReport));

export default router;
