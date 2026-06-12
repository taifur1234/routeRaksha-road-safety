import express from "express";
import {
  clearRouteHistory,
  createRouteHistory,
  createSavedRoute,
  deleteSavedRoute,
  listRouteHistory,
  listSavedRoutes,
  updateSavedRoute,
} from "../controllers/routeController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter, userOrIpKey } from "../middleware/rateLimit.js";

const router = express.Router();
const routeWriteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Route actions are being used too quickly. Please slow down.",
  keyGenerator: userOrIpKey,
});
const routeHistoryLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "Route searches are being saved too quickly. Please slow down.",
  keyGenerator: userOrIpKey,
});

router.use(requireAuth);

router.get("/saved", asyncHandler(listSavedRoutes));
router.post("/saved", routeWriteLimiter, asyncHandler(createSavedRoute));
router.patch("/saved/:id", routeWriteLimiter, asyncHandler(updateSavedRoute));
router.delete("/saved/:id", routeWriteLimiter, asyncHandler(deleteSavedRoute));

router.get("/history", asyncHandler(listRouteHistory));
router.post("/history", routeHistoryLimiter, asyncHandler(createRouteHistory));
router.delete("/history", routeWriteLimiter, asyncHandler(clearRouteHistory));

export default router;
