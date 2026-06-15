import {
  fetchEmergencyServices,
  getFallbackServices,
  getRouteCenter,
  normalizeRoutePoints,
} from "../services/emergencyService.js";
import { isValidCoordinate, toFiniteNumber } from "../utils/validation.js";

function normalizeTypes(value) {
  if (Array.isArray(value)) {
    return value.map((type) => String(type).trim().toLowerCase());
  }

  return String(value || "")
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
}

async function findNearbyEmergencyServices(req, res) {
  const body = req.body || {};
  const routePoints = normalizeRoutePoints(body.routePoints || []);
  const requestedCenter = {
    lat: toFiniteNumber(body.lat),
    lng: toFiniteNumber(body.lng),
  };
  const center = isValidCoordinate(requestedCenter.lat, requestedCenter.lng)
    ? requestedCenter
    : getRouteCenter(routePoints);

  if (!center || !isValidCoordinate(center.lat, center.lng)) {
    return res.status(400).json({ ok: false, message: "A valid center or route is required." });
  }

  const radiusMeters = toFiniteNumber(body.radiusMeters, process.env.EMERGENCY_DEFAULT_RADIUS_METERS || 5000);
  const types = normalizeTypes(body.types);

  try {
    const services = await fetchEmergencyServices({ center, radiusMeters, types, routePoints });

    return res.json({ ok: true, services, cached: false });
  } catch (error) {
    const fallback = getFallbackServices(center, routePoints)
      .filter((service) => {
        const selectedTypes = types.length ? types : ["hospital", "police"];
        return selectedTypes.includes(service.type);
      })
      .filter((service) => service.distanceFromCenterMeters <= Number(radiusMeters || 5000) * 1.5);

    if (fallback.length) {
      return res.json({ ok: true, services: fallback, fallback: true });
    }

    return res.status(502).json({
      ok: false,
      message: error.message || "Emergency services are unavailable.",
    });
  }
}

export { findNearbyEmergencyServices };
