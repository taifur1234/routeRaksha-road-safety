import SavedRoute from "../models/SavedRoute.js";
import RouteHistory from "../models/RouteHistory.js";
import {
  cleanSearch,
  cleanText,
  getPagination,
  isValidCoordinate,
  isValidObjectId,
  toFiniteNumber,
} from "../utils/validation.js";

const ROUTE_TYPES = new Set(["fastest", "safest", "balanced"]);

function normalizeRouteType(value) {
  const routeType = String(value || "").trim().toLowerCase();
  return ROUTE_TYPES.has(routeType) ? routeType : "";
}

function normalizePoint(value, fieldName) {
  const label = cleanText(value?.label, 260);
  const lat = toFiniteNumber(value?.lat);
  const lng = toFiniteNumber(value?.lng);

  if (!label || !isValidCoordinate(lat, lng)) {
    const error = new Error(`${fieldName} is invalid.`);
    error.statusCode = 400;
    throw error;
  }

  return { label, lat, lng };
}

function normalizeMetrics(body) {
  const safetyScore = toFiniteNumber(body.safetyScore);
  const distanceMeters = Math.max(0, toFiniteNumber(body.distanceMeters, 0));
  const durationSeconds = Math.max(0, toFiniteNumber(body.durationSeconds, 0));
  const blackSpotCount = Math.max(0, Number.parseInt(body.blackSpotCount, 10) || 0);
  const routeType = normalizeRouteType(body.routeType);

  if (!routeType) {
    const error = new Error("Route type must be fastest, safest, or balanced.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(safetyScore) || safetyScore < 0 || safetyScore > 100) {
    const error = new Error("Safety score must be between 0 and 100.");
    error.statusCode = 400;
    throw error;
  }

  return {
    safetyScore: Math.round(safetyScore),
    routeType,
    distanceMeters,
    durationSeconds,
    blackSpotCount,
  };
}

function normalizeRoute(route) {
  return {
    id: route._id,
    routeName: route.routeName,
    source: route.source,
    destination: route.destination,
    safetyScore: route.safetyScore,
    routeType: route.routeType,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
    blackSpotCount: route.blackSpotCount,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  };
}

function normalizeHistory(history) {
  return {
    id: history._id,
    source: history.source,
    destination: history.destination,
    safetyScore: history.safetyScore,
    routeType: history.routeType,
    searchedAt: history.searchedAt,
    createdAt: history.createdAt,
  };
}

async function listSavedRoutes(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 8, maxLimit: 25 });
  const search = cleanSearch(req.query.search, 80);
  const filter = { user: req.user._id };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { routeName: regex },
      { "source.label": regex },
      { "destination.label": regex },
      { routeType: regex },
    ];
  }

  const [items, total] = await Promise.all([
    SavedRoute.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SavedRoute.countDocuments(filter),
  ]);

  return res.json({
    ok: true,
    routes: items.map(normalizeRoute),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

async function createSavedRoute(req, res) {
  const routeName = cleanText(req.body.routeName, 80);

  if (routeName.length < 2) {
    return res.status(400).json({ ok: false, message: "Route name must be at least 2 characters." });
  }

  const route = await SavedRoute.create({
    user: req.user._id,
    routeName,
    source: normalizePoint(req.body.source, "Source"),
    destination: normalizePoint(req.body.destination, "Destination"),
    ...normalizeMetrics(req.body),
  });

  return res.status(201).json({ ok: true, route: normalizeRoute(route) });
}

async function updateSavedRoute(req, res) {
  const routeName = cleanText(req.body.routeName, 80);

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid route id." });
  }

  if (routeName.length < 2) {
    return res.status(400).json({ ok: false, message: "Route name must be at least 2 characters." });
  }

  const route = await SavedRoute.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { routeName } },
    { new: true, runValidators: true },
  );

  if (!route) {
    return res.status(404).json({ ok: false, message: "Saved route not found." });
  }

  return res.json({ ok: true, route: normalizeRoute(route) });
}

async function deleteSavedRoute(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid route id." });
  }

  const route = await SavedRoute.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!route) {
    return res.status(404).json({ ok: false, message: "Saved route not found." });
  }

  return res.json({ ok: true, route: normalizeRoute(route) });
}

async function listRouteHistory(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 8, maxLimit: 25 });
  const [items, total] = await Promise.all([
    RouteHistory.find({ user: req.user._id }).sort({ searchedAt: -1 }).skip(skip).limit(limit),
    RouteHistory.countDocuments({ user: req.user._id }),
  ]);

  return res.json({
    ok: true,
    history: items.map(normalizeHistory),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

async function createRouteHistory(req, res) {
  const metrics = normalizeMetrics(req.body);
  const history = await RouteHistory.create({
    user: req.user._id,
    source: normalizePoint(req.body.source, "Source"),
    destination: normalizePoint(req.body.destination, "Destination"),
    safetyScore: metrics.safetyScore,
    routeType: metrics.routeType,
    searchedAt: new Date(),
  });

  return res.status(201).json({ ok: true, history: normalizeHistory(history) });
}

async function clearRouteHistory(req, res) {
  const result = await RouteHistory.deleteMany({ user: req.user._id });

  return res.json({ ok: true, deletedCount: result.deletedCount || 0 });
}

export {
  clearRouteHistory,
  createRouteHistory,
  createSavedRoute,
  deleteSavedRoute,
  listRouteHistory,
  listSavedRoutes,
  updateSavedRoute,
};
