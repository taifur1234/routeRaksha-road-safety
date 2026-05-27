import express from "express";
import { searchPlaces } from "../controllers/placeController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
const placeSearchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: "Place search is being used too quickly. Please slow down and try again.",
});

router.get("/search", placeSearchLimiter, searchPlaces);

export default router;
