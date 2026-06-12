import { cleanText, isValidCoordinate, toFiniteNumber } from "../utils/validation.js";

const CACHE_TTL_MS = Number(process.env.EMERGENCY_CACHE_TTL_MS || 10 * 60 * 1000);
const MAX_RADIUS_METERS = Number(process.env.EMERGENCY_MAX_RADIUS_METERS || 15000);
const serviceCache = new Map();

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(a, b) {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function distancePointToSegment(point, segmentStart, segmentEnd) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(toRadians(point.lat));
  const startX = (segmentStart.lng - point.lng) * metersPerDegreeLng;
  const startY = (segmentStart.lat - point.lat) * metersPerDegreeLat;
  const endX = (segmentEnd.lng - point.lng) * metersPerDegreeLng;
  const endY = (segmentEnd.lat - point.lat) * metersPerDegreeLat;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (!segmentLengthSquared) {
    return Math.sqrt(startX * startX + startY * startY);
  }

  const t = Math.max(0, Math.min(1, -(startX * deltaX + startY * deltaY) / segmentLengthSquared));
  const projectedX = startX + t * deltaX;
  const projectedY = startY + t * deltaY;

  return Math.sqrt(projectedX * projectedX + projectedY * projectedY);
}

function distanceToRoute(point, routePoints = []) {
  if (!routePoints.length) {
    return null;
  }

  if (routePoints.length === 1) {
    return distanceInMeters(point, routePoints[0]);
  }

  return routePoints.slice(1).reduce((nearest, routePoint, index) => {
    return Math.min(nearest, distancePointToSegment(point, routePoints[index], routePoint));
  }, Infinity);
}

function normalizeRoutePoints(points = []) {
  return points
    .slice(0, 250)
    .map((point) => ({
      lat: toFiniteNumber(point?.lat ?? point?.[0]),
      lng: toFiniteNumber(point?.lng ?? point?.[1]),
    }))
    .filter((point) => isValidCoordinate(point.lat, point.lng));
}

function getRouteCenter(routePoints) {
  if (!routePoints.length) {
    return null;
  }

  const middle = routePoints[Math.floor(routePoints.length / 2)];
  return { lat: middle.lat, lng: middle.lng };
}

function normalizeService(element, center, routePoints) {
  const lat = toFiniteNumber(element.lat ?? element.center?.lat);
  const lng = toFiniteNumber(element.lon ?? element.center?.lon);

  if (!isValidCoordinate(lat, lng)) {
    return null;
  }

  const amenity = cleanText(element.tags?.amenity, 30);
  const serviceType = amenity === "police" ? "police" : "hospital";
  const point = { lat, lng };

  return {
    id: String(element.id),
    name:
      cleanText(element.tags?.name, 120) ||
      (serviceType === "police" ? "Police Station" : "Hospital"),
    type: serviceType,
    lat,
    lng,
    address: cleanText(
      [
        element.tags?.["addr:housenumber"],
        element.tags?.["addr:street"],
        element.tags?.["addr:city"],
      ]
        .filter(Boolean)
        .join(", "),
      220,
    ),
    phone: cleanText(element.tags?.phone || element.tags?.["contact:phone"], 60),
    distanceFromCenterMeters: Math.round(distanceInMeters(center, point)),
    distanceFromRouteMeters: routePoints.length ? Math.round(distanceToRoute(point, routePoints)) : null,
    source: "openstreetmap",
  };
}

function getFallbackServices(center, routePoints) {
  const fallback = [
    {
      id: "fallback-khargone-district-hospital",
      name: "District Hospital Khargone",
      type: "hospital",
      lat: 21.8247,
      lng: 75.6169,
      address: "Khargone, Madhya Pradesh",
      phone: "",
      source: "local-fallback",
    },
    {
      id: "fallback-khargone-police-station",
      name: "Khargone Police Station",
      type: "police",
      lat: 21.8274,
      lng: 75.6145,
      address: "Khargone, Madhya Pradesh",
      phone: "",
      source: "local-fallback",
    },
  ];

  return fallback.map((service) => ({
    ...service,
    distanceFromCenterMeters: Math.round(distanceInMeters(center, service)),
    distanceFromRouteMeters: routePoints.length ? Math.round(distanceToRoute(service, routePoints)) : null,
  }));
}

async function fetchEmergencyServices({ center, radiusMeters, types, routePoints }) {
  const radius = Math.min(Math.max(Number(radiusMeters) || 3000, 500), MAX_RADIUS_METERS);
  const normalizedTypes = types.filter((type) => ["hospital", "police"].includes(type));
  const selectedTypes = normalizedTypes.length ? normalizedTypes : ["hospital", "police"];
  const cacheKey = [
    center.lat.toFixed(3),
    center.lng.toFixed(3),
    radius,
    selectedTypes.join(","),
  ].join(":");
  const cached = serviceCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.services.map((service) => ({
      ...service,
      distanceFromRouteMeters: routePoints.length
        ? Math.round(distanceToRoute(service, routePoints))
        : service.distanceFromRouteMeters,
    }));
  }

  const amenityFilter = selectedTypes.map((type) => `node["amenity"="${type}"](around:${radius},${center.lat},${center.lng});way["amenity"="${type}"](around:${radius},${center.lat},${center.lng});`).join("");
  const query = `[out:json][timeout:12];(${amenityFilter});out center tags 40;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
    },
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    throw new Error("Emergency service search is unavailable.");
  }

  const data = await response.json();
  const seen = new Set();
  const services = (data.elements || [])
    .map((element) => normalizeService(element, center, routePoints))
    .filter(Boolean)
    .filter((service) => {
      const key = `${service.type}:${service.name.toLowerCase()}:${service.lat.toFixed(5)}:${service.lng.toFixed(5)}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aDistance = a.distanceFromRouteMeters ?? a.distanceFromCenterMeters;
      const bDistance = b.distanceFromRouteMeters ?? b.distanceFromCenterMeters;
      return aDistance - bDistance;
    })
    .slice(0, 40);

  serviceCache.set(cacheKey, { services, createdAt: Date.now() });
  return services;
}

export { fetchEmergencyServices, getFallbackServices, getRouteCenter, normalizeRoutePoints };
