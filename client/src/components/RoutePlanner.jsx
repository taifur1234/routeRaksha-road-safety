import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  clearRouteHistory,
  deleteSavedRoute,
  findEmergencyServices,
  listRouteHistory,
  listSavedRoutes,
  recordRouteHistory,
  renameSavedRoute,
  saveRoute,
} from "../utils/routeApi";
import { readApprovedAccidentReports } from "../utils/reportStore";
import {
  KHARGONE_CENTER,
  calculateRouteSafety,
  clusterBlackspots,
  distanceInMeters,
  findNearbyRisks,
  formatMeters,
  getDangerousRouteSegments,
  getRouteBlackspots,
  getSeverityMeta,
  getVerificationMeta,
  normalize as normalizeSafety,
} from "../utils/safetyData";

const LEAFLET_SCRIPT_ID = "leaflet-js";
const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_SCRIPT_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DEFAULT_CENTER = KHARGONE_CENTER;
const SUGGESTION_MIN_LENGTH = 3;
const SEARCH_BIAS_DEGREES = 0.65;
const MAX_STALE_GPS_AGE_MS = 30 * 1000;
const MAX_WEAK_GPS_ACCURACY_METERS = 10000;
const STRONG_GPS_ACCURACY_METERS = 2500;
const KHARGONE_PILOT_RADIUS_METERS = 85000;
const LIVE_NAVIGATION_OFF_ROUTE_METERS = 140;
const LIVE_NAVIGATION_NEARBY_RISK_REFRESH_MS = 12000;
const INDORE_CENTER = { lat: 22.7196, lng: 75.8577 };
const KHARGONE_CITY_POINT = { lat: KHARGONE_CENTER[0], lng: KHARGONE_CENTER[1] };
const CITY_ROUTE_MATCH_RADIUS_METERS = 45000;
const KHARGONE_INDORE_CORRIDOR_WAYPOINTS = [
  { lat: 22.1269, lng: 75.6118, label: "Kasrawad corridor" },
  { lat: 22.15734, lng: 75.44606, label: "Khalghat / Sanjay Setu" },
  { lat: 22.335, lng: 75.54, label: "Ganesh Ghat" },
  { lat: 22.4315, lng: 75.6211, label: "Manpur slope" },
];

function makeLocalPlace(id, label, lat, lng, type, aliases = []) {
  return {
    id,
    label,
    lat,
    lng,
    type,
    keywords: [label, label.replace(/,\s*Madhya Pradesh.*/i, ""), ...aliases],
  };
}

const localPlaces = [
  makeLocalPlace(
    "local-radha-vallabh-market-khargone",
    "Radha Vallabh Market, Jawahar Nagar, Khargone, Madhya Pradesh 451001",
    21.8259,
    75.6132,
    "Market",
    [
      "radha vallabh market",
      "radha vallab market",
      "radhavallabh market",
      "radhavallab market",
      "new radha vallabh market",
      "new radha vallab market",
      "new radhavallabh market",
      "new radhavallab market",
      "radha vallabh khargone",
      "radha vallab khargone",
      "radhavallabh khargone",
      "radhavallab khargone",
      "jawahar nagar khargone",
    ],
  ),
  makeLocalPlace("local-khargone-city", "Khargone, Madhya Pradesh", 21.8257, 75.6132, "City", [
    "khargone city",
    "khargone bus stand",
    "khargone district",
  ]),
  makeLocalPlace("local-indore-city", "Indore, Madhya Pradesh", 22.7196, 75.8577, "City", [
    "indore",
    "indore city",
    "indor",
    "indore madhya pradesh",
  ]),
  makeLocalPlace("local-sanawad", "Sanawad, Khargone, Madhya Pradesh", 22.1736, 76.0694, "Town", [
    "sanawad road",
    "sanawad khargone",
    "sanawad",
  ]),
  makeLocalPlace("local-sendhwa", "Sendhwa, Madhya Pradesh", 21.6856, 75.0962, "Town", [
    "sendhwa road",
    "sendhwa",
    "sendwa",
    "sendwa road",
  ]),
  makeLocalPlace("local-gogawa", "Gogawa, Khargone, Madhya Pradesh", 21.9146, 75.5602, "Town", [
    "gogawa road",
    "gogawa",
    "gogaon",
  ]),
  makeLocalPlace("local-mandav", "Mandav, Dhar, Madhya Pradesh", 22.3373, 75.3967, "Historic town", [
    "mandav",
    "mandu",
    "mandavgarh",
    "mandu fort",
  ]),
  makeLocalPlace("local-maheshwar", "Maheshwar, Khargone, Madhya Pradesh", 22.1765, 75.5872, "Town", [
    "maheshwar ghat",
    "maheshwar road",
    "maheshwar",
  ]),
  makeLocalPlace("local-bistan", "Bistan, Khargone, Madhya Pradesh", 21.7538, 75.7612, "Village", [
    "bistan road",
    "bistan",
    "bistan naka",
  ]),
  makeLocalPlace("local-lohari", "Lohari, Khargone, Madhya Pradesh", 21.8878, 75.7046, "Village", [
    "lohari",
    "lohari road",
  ]),
  makeLocalPlace("local-jetapur", "Jetapur, Khargone, Madhya Pradesh", 21.8362, 75.5906, "Locality", [
    "jetapur",
    "jetapur road",
    "jaitapur",
  ]),
  makeLocalPlace("local-jam-gate", "Jam Gate, near Mandleshwar, Madhya Pradesh", 22.3111, 75.7818, "Landmark", [
    "jam gate",
    "jamgate",
    "jam darwaza",
    "mandleshwar jam gate",
  ]),
  makeLocalPlace("local-bhikangaon", "Bhikangaon, Khargone, Madhya Pradesh", 21.8676, 75.9531, "Town", [
    "bhikangaon",
    "bhikangaon road",
    "bhikangoan",
  ]),
  makeLocalPlace("local-kasrawad", "Kasrawad, Khargone, Madhya Pradesh", 22.1269, 75.6118, "Town", [
    "kasrawad",
    "kasrawad road",
  ]),
  makeLocalPlace("local-mandleshwar", "Mandleshwar, Khargone, Madhya Pradesh", 22.1769, 75.6596, "Town", [
    "mandleshwar",
    "mandleshwar road",
  ]),
  makeLocalPlace("local-barwaha", "Barwaha, Khargone, Madhya Pradesh", 22.2531, 76.0382, "Town", [
    "barwaha",
    "barwaha road",
  ]),
  makeLocalPlace("local-segaon", "Segaon, Khargone, Madhya Pradesh", 21.7198, 75.6101, "Town", [
    "segaon",
    "segaon road",
  ]),
  makeLocalPlace("local-bhagwanpura", "Bhagwanpura, Khargone, Madhya Pradesh", 21.6547, 75.6261, "Town", [
    "bhagwanpura",
    "bhagwanpura road",
  ]),
  makeLocalPlace("local-oon", "Oon, Khargone, Madhya Pradesh", 21.7984, 75.4338, "Town", [
    "oon",
    "un khargone",
    "oon road",
  ]),
  makeLocalPlace("local-dongargaon-bridge", "Dongargaon bridge, Khargone, Madhya Pradesh", 21.7819, 75.5882, "Bridge", [
    "dongargaon",
    "dongargaon bridge",
    "dongargaon pul",
  ]),
];

const severityStyles = {
  high: {
    label: "High risk",
    color: "#dc2626",
    fillColor: "#ef4444",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    label: "Medium risk",
    color: "#d97706",
    fillColor: "#f59e0b",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    label: "Low risk",
    color: "#16a34a",
    fillColor: "#22c55e",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    crosshair: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 4.5-8 12-8 12S4 14.5 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    navigation: <path d="m12 2 7 19-7-4-7 4z" />,
    route: (
      <>
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M12 19h3.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H12" />
      </>
    ),
    save: (
      <>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <path d="M17 21v-8H7v8" />
        <path d="M7 3v5h8" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
    hospital: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 10h6" />
        <path d="M12 7v6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    stopCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (!document.getElementById(LEAFLET_CSS_ID)) {
    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }

  const existingScript = document.getElementById(LEAFLET_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Map library failed to load.")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = LEAFLET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Map library failed to load."));
    document.head.appendChild(script);
  });
}

function parseCoordinatePair(value) {
  const match = value.trim().match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);

  if (!match) {
    return null;
  }

  return {
    lat: Number(match[1]),
    lng: Number(match[3]),
    label: value,
  };
}

function isUsableGpsPosition(position) {
  const point = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  const accuracy = Number(position.coords.accuracy || Infinity);
  const age = Date.now() - Number(position.timestamp || 0);
  const distanceFromKhargone = distanceInMeters(KHARGONE_CITY_POINT, point);

  return (
    age <= MAX_STALE_GPS_AGE_MS &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    accuracy <= MAX_WEAK_GPS_ACCURACY_METERS &&
    (accuracy <= STRONG_GPS_ACCURACY_METERS || distanceFromKhargone <= KHARGONE_PILOT_RADIUS_METERS)
  );
}

function isNearPoint(point, target, radiusMeters) {
  return Boolean(point) && distanceInMeters(point, target) <= radiusMeters;
}

function getKhargoneIndoreCorridorWaypoints(origin, destination) {
  const startsNearKhargone = isNearPoint(origin, KHARGONE_CITY_POINT, CITY_ROUTE_MATCH_RADIUS_METERS);
  const endsNearKhargone = isNearPoint(destination, KHARGONE_CITY_POINT, CITY_ROUTE_MATCH_RADIUS_METERS);
  const startsNearIndore = isNearPoint(origin, INDORE_CENTER, CITY_ROUTE_MATCH_RADIUS_METERS);
  const endsNearIndore = isNearPoint(destination, INDORE_CENTER, CITY_ROUTE_MATCH_RADIUS_METERS);

  if (startsNearKhargone && endsNearIndore) {
    return KHARGONE_INDORE_CORRIDOR_WAYPOINTS;
  }

  if (startsNearIndore && endsNearKhargone) {
    return [...KHARGONE_INDORE_CORRIDOR_WAYPOINTS].reverse();
  }

  return [];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function compactSearchValue(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ");
}

function findLocalPlace(query) {
  const compactQuery = compactSearchValue(query);

  if (!compactQuery) {
    return null;
  }

  return (
    localPlaces.find((place) => {
      return place.keywords.some((keyword) => {
        const compactKeyword = compactSearchValue(keyword);
        return compactQuery.includes(compactKeyword) || compactKeyword.includes(compactQuery);
      });
    }) || null
  );
}

function getSeverityStyle(severity) {
  const meta = getSeverityMeta(severity);
  return {
    ...(severityStyles[normalize(severity)] || severityStyles.medium),
    label: meta.label,
    color: meta.color,
    fillColor: meta.color,
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function LocationSuggestions({ suggestions, isSearching, onSelect }) {
  if (!isSearching && !suggestions.length) {
    return null;
  }

  return (
    <div className="absolute left-14 right-0 top-[calc(100%+0.35rem)] z-[1000] overflow-hidden rounded-xl border border-[#d8e5d3] bg-white shadow-[0_18px_44px_rgba(16,47,0,0.16)]">
      {isSearching && (
        <p className="px-4 py-3 text-sm font-bold text-[#46623d]">Searching places...</p>
      )}

      {!isSearching &&
        suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(suggestion)}
            className="block w-full border-t border-[#eef4eb] px-4 py-3 text-left transition first:border-t-0 hover:bg-[#f1f6f0]"
          >
            <span className="block line-clamp-2 text-sm font-black text-[#173a0b]">
              {suggestion.label}
            </span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#78936d]">
              {suggestion.type}
            </span>
          </button>
        ))}
    </div>
  );
}

async function geocodeLocation(query) {
  const coordinates = parseCoordinatePair(query);

  if (coordinates) {
    return coordinates;
  }

  const localPlace = findLocalPlace(query);

  if (localPlace) {
    return {
      lat: localPlace.lat,
      lng: localPlace.lng,
      label: localPlace.label,
    };
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Location search failed. Please try again.");
  }

  const results = await response.json();
  const first = results[0];

  if (!first) {
    throw new Error(`Could not find "${query}". Try a more specific address.`);
  }

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    label: first.display_name,
  };
}

async function searchLocationSuggestions(query, biasCenter = DEFAULT_CENTER) {
  if (query.trim().length < SUGGESTION_MIN_LENGTH || parseCoordinatePair(query)) {
    return [];
  }

  const unique = new Map();
  const localMatches = localPlaces.filter((place) => {
    const compactQuery = compactSearchValue(query);
    return place.keywords.some((keyword) => {
      const compactKeyword = compactSearchValue(keyword);
      return compactQuery.includes(compactKeyword) || compactKeyword.includes(compactQuery);
    });
  });

  localMatches.forEach((place) => unique.set(place.id, place));

  try {
    const geoapifySuggestions = await fetchGeoapifySuggestions(query, biasCenter);
    geoapifySuggestions.forEach((item) => {
      const key = `${Number(item.lat).toFixed(5)},${Number(item.lng).toFixed(5)}`;
      unique.set(key, item);
    });
  } catch {
    // The local and Nominatim fallbacks keep route search usable when the API is unavailable.
  }

  if (unique.size < 5) {
    const searches = [
      { query, countrycodes: "in", viewbox: true, biasCenter },
      { query: `${query}, Madhya Pradesh, India`, countrycodes: "in", viewbox: false },
      { query: `${query}, India`, countrycodes: "in", viewbox: false },
    ];

    for (const search of searches) {
      const results = await fetchLocationSuggestions(search);

      results.forEach((item) => {
        const key = `${Number(item.lat).toFixed(5)},${Number(item.lon).toFixed(5)}`;

        if (!unique.has(key)) {
          unique.set(key, item);
        }
      });

      if (unique.size >= 5) {
        break;
      }
    }
  }

  return Array.from(unique.values())
    .slice(0, 5)
    .map((item) => ({
      id: item.id || item.place_id,
      label: item.label || item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lng ?? item.lon),
      type: item.type || item.class || "Place",
    }));
}

async function fetchGeoapifySuggestions(query, biasCenter = DEFAULT_CENTER) {
  const [lat, lng] = biasCenter;
  const url = new URL(`${API_URL}/api/places/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Place suggestions failed.");
  }

  return data.suggestions || [];
}

async function fetchLocationSuggestions({ query, countrycodes, viewbox, biasCenter = DEFAULT_CENTER }) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("accept-language", "en");
  url.searchParams.set("q", query);

  if (countrycodes) {
    url.searchParams.set("countrycodes", countrycodes);
  }

  if (viewbox) {
    const [lat, lng] = biasCenter;
    const left = lng - SEARCH_BIAS_DEGREES;
    const right = lng + SEARCH_BIAS_DEGREES;
    const top = lat + SEARCH_BIAS_DEGREES;
    const bottom = lat - SEARCH_BIAS_DEGREES;
    url.searchParams.set("viewbox", `${left},${top},${right},${bottom}`);
    url.searchParams.set("bounded", "0");
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) {
    return "Not available";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "Not available";
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function formatSpeed(speedMetersPerSecond) {
  if (!Number.isFinite(speedMetersPerSecond) || speedMetersPerSecond < 0.5) {
    return "0 km/h";
  }

  return `${Math.round(speedMetersPerSecond * 3.6)} km/h`;
}

const routeTypeMeta = {
  fastest: {
    label: "Fastest Route",
    badge: "Fastest",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    lineColor: "#2563eb",
  },
  safest: {
    label: "Safest Route",
    badge: "Safest",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lineColor: "#059669",
  },
  balanced: {
    label: "Balanced Route",
    badge: "Balanced",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    lineColor: "#7c3aed",
  },
};

function getRouteTypeMeta(routeType) {
  return routeTypeMeta[routeType] || routeTypeMeta.balanced;
}

function getComparableScore(route, fastestDuration, shortestDistance) {
  const timePenalty = fastestDuration ? ((route.duration - fastestDuration) / fastestDuration) * 22 : 0;
  const distancePenalty = shortestDistance ? ((route.distance - shortestDistance) / shortestDistance) * 10 : 0;

  return route.safety.safetyScore - timePenalty - distancePenalty;
}

function pickRouteOptions(candidates) {
  if (!candidates.length) {
    return [];
  }

  const fastest = candidates.reduce((best, route) => (route.duration < best.duration ? route : best), candidates[0]);
  const safest = candidates.reduce((best, route) => {
    if (route.safety.safetyScore === best.safety.safetyScore) {
      return route.duration < best.duration ? route : best;
    }

    return route.safety.safetyScore > best.safety.safetyScore ? route : best;
  }, candidates[0]);
  const fastestDuration = fastest.duration;
  const shortestDistance = candidates.reduce((best, route) => Math.min(best, route.distance), candidates[0].distance);
  const balanced = candidates.reduce((best, route) => {
    return getComparableScore(route, fastestDuration, shortestDistance) >
      getComparableScore(best, fastestDuration, shortestDistance)
      ? route
      : best;
  }, candidates[0]);

  return [
    { ...fastest, routeType: "fastest" },
    { ...safest, routeType: "safest" },
    { ...balanced, routeType: "balanced" },
  ];
}

function getBearing(start, end) {
  const startLat = (start.lat * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const deltaLng = ((end.lng - start.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

function toRoutePoint(latLng) {
  if (Array.isArray(latLng)) {
    return { lat: Number(latLng[0]), lng: Number(latLng[1]) };
  }

  return { lat: Number(latLng.lat), lng: Number(latLng.lng) };
}

function getProjectedPointOnSegment(point, segmentStart, segmentEnd) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((point.lat * Math.PI) / 180);
  const startX = (segmentStart.lng - point.lng) * metersPerDegreeLng;
  const startY = (segmentStart.lat - point.lat) * metersPerDegreeLat;
  const endX = (segmentEnd.lng - point.lng) * metersPerDegreeLng;
  const endY = (segmentEnd.lat - point.lat) * metersPerDegreeLat;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;
  const t = segmentLengthSquared
    ? Math.max(0, Math.min(1, -(startX * deltaX + startY * deltaY) / segmentLengthSquared))
    : 0;
  const projectedPoint = {
    lat: segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * t,
    lng: segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * t,
  };

  return {
    point: projectedPoint,
    ratio: t,
    distance: distanceInMeters(point, projectedPoint),
  };
}

function getRouteProgress(position, routeLatLngs = []) {
  const routePoints = routeLatLngs.map(toRoutePoint);

  if (routePoints.length < 2) {
    return {
      distanceFromRoute: Infinity,
      remainingDistance: 0,
      remainingLatLngs: [[position.lat, position.lng]],
    };
  }

  let best = null;
  let completedBeforeSegment = 0;

  routePoints.slice(1).forEach((segmentEnd, index) => {
    const segmentStart = routePoints[index];
    const segmentLength = distanceInMeters(segmentStart, segmentEnd);
    const projection = getProjectedPointOnSegment(position, segmentStart, segmentEnd);

    if (!best || projection.distance < best.distanceFromRoute) {
      best = {
        index,
        projection: projection.point,
        ratio: projection.ratio,
        segmentLength,
        completedBeforeSegment,
        distanceFromRoute: projection.distance,
      };
    }

    completedBeforeSegment += segmentLength;
  });

  const completedDistance = best.completedBeforeSegment + best.segmentLength * best.ratio;
  const totalDistance = routePoints.slice(1).reduce((sum, point, index) => {
    return sum + distanceInMeters(routePoints[index], point);
  }, 0);
  const remainingDistance = Math.max(0, totalDistance - completedDistance);
  const snappedStart =
    best.distanceFromRoute <= LIVE_NAVIGATION_OFF_ROUTE_METERS
      ? { lat: position.lat, lng: position.lng }
      : best.projection;
  const remainingLatLngs = [
    [snappedStart.lat, snappedStart.lng],
    ...routePoints.slice(best.index + 1).map((point) => [point.lat, point.lng]),
  ];

  return {
    completedDistance,
    distanceFromRoute: best.distanceFromRoute,
    remainingDistance,
    remainingLatLngs,
  };
}

async function fetchRoutes(origin, destination, profile, waypoints = [], alternatives = false) {
  const routePoints = [origin, ...waypoints, destination];
  const coordinates = routePoints.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=false&alternatives=${alternatives ? "true" : "false"}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Route service is not reachable right now.");
  }

  const data = await response.json();
  const routes = data.routes || [];

  if (!routes.length) {
    throw new Error("Route not found. Try a more specific pickup or destination.");
  }

  return routes;
}

async function fetchRoute(origin, destination, profile, waypoints = []) {
  const routes = await fetchRoutes(origin, destination, profile, waypoints);
  return routes[0];
}

async function fetchBikeRoute(origin, destination, carRoute, waypoints = []) {
  const profiles = ["bike", "cycling"];

  for (const profile of profiles) {
    try {
      return await fetchRoute(origin, destination, profile, waypoints);
    } catch {
      // Some public OSRM deployments only expose the driving profile.
    }
  }

  return {
    distance: carRoute.distance,
    duration: (carRoute.distance / 1000 / 28) * 60 * 60,
    isEstimate: true,
  };
}

function RoutePlanner() {
  const { isLoggedIn } = useAuth();
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [mapError, setMapError] = useState("");
  const [activeSuggestionField, setActiveSuggestionField] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeSummary, setRouteSummary] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteType, setSelectedRouteType] = useState("balanced");
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [routePage, setRoutePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [savedPagination, setSavedPagination] = useState(null);
  const [historyPagination, setHistoryPagination] = useState(null);
  const [routeDataStatus, setRouteDataStatus] = useState("");
  const [routeDataError, setRouteDataError] = useState("");
  const [savingRouteType, setSavingRouteType] = useState("");
  const [editingRouteId, setEditingRouteId] = useState("");
  const [editingRouteName, setEditingRouteName] = useState("");
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [emergencyStatus, setEmergencyStatus] = useState("");
  const [emergencyError, setEmergencyError] = useState("");
  const [showHospitals, setShowHospitals] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [emergencyRadius, setEmergencyRadius] = useState(5000);
  const [nearbyRisks, setNearbyRisks] = useState([]);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [navigationState, setNavigationState] = useState(null);
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const dangerSegmentLayerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const blackspotLayerRef = useRef(null);
  const emergencyLayerRef = useRef(null);
  const liveNavigationLayerRef = useRef(null);
  const liveMarkerRef = useRef(null);
  const liveAccuracyCircleRef = useRef(null);
  const watchPositionIdRef = useRef(null);
  const routeSummaryRef = useRef(null);
  const nearbyRiskRefreshAtRef = useRef(0);
  const lastLivePositionRef = useRef(null);

  const getSearchBiasCenter = useCallback(function getSearchBiasCenter() {
    const center = mapRef.current?.getCenter?.();

    if (center) {
      return [center.lat, center.lng];
    }

    return DEFAULT_CENTER;
  }, []);

  useEffect(() => {
    routeSummaryRef.current = routeSummary;
  }, [routeSummary]);

  useEffect(() => {
    if (!isLoggedIn) {
      setSavedRoutes([]);
      setRouteHistory([]);
      return;
    }

    let isMounted = true;

    async function loadRouteData() {
      setRouteDataError("");

      try {
        const [savedData, historyData] = await Promise.all([
          listSavedRoutes({ page: routePage, search: routeSearch }),
          listRouteHistory({ page: historyPage }),
        ]);

        if (!isMounted) {
          return;
        }

        setSavedRoutes(savedData.routes || []);
        setSavedPagination(savedData.pagination || null);
        setRouteHistory(historyData.history || []);
        setHistoryPagination(historyData.pagination || null);
      } catch (error) {
        if (isMounted) {
          setRouteDataError(error.message || "Saved route data is unavailable.");
        }
      }
    }

    loadRouteData();

    return () => {
      isMounted = false;
    };
  }, [historyPage, isLoggedIn, routePage, routeSearch]);

  useEffect(() => {
    return () => {
      if (watchPositionIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapElementRef.current || mapRef.current) {
          return;
        }

        mapRef.current = L.map(mapElementRef.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);

        markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
        blackspotLayerRef.current = L.layerGroup().addTo(mapRef.current);
        emergencyLayerRef.current = L.layerGroup().addTo(mapRef.current);
        dangerSegmentLayerRef.current = L.layerGroup().addTo(mapRef.current);
        liveNavigationLayerRef.current = L.layerGroup().addTo(mapRef.current);
        setIsMapReady(true);
        setMapError("");
      })
      .catch((error) => {
        if (isMounted) {
          setMapError(error.message || "Map failed to load.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || activeSuggestionField !== "origin") {
      return;
    }

    let isMounted = true;
    const canSearch = currentLocation.trim().length >= SUGGESTION_MIN_LENGTH && !parseCoordinatePair(currentLocation);
    setIsSearchingOrigin(canSearch);

    if (!canSearch) {
      setOriginSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchLocationSuggestions(currentLocation, getSearchBiasCenter())
        .then((suggestions) => {
          if (isMounted) {
            setOriginSuggestions(suggestions);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsSearchingOrigin(false);
          }
        });
    }, 350);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [activeSuggestionField, currentLocation, getSearchBiasCenter, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || activeSuggestionField !== "destination") {
      return;
    }

    let isMounted = true;
    const canSearch = destination.trim().length >= SUGGESTION_MIN_LENGTH && !parseCoordinatePair(destination);
    setIsSearchingDestination(canSearch);

    if (!canSearch) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchLocationSuggestions(destination, getSearchBiasCenter())
        .then((suggestions) => {
          if (isMounted) {
            setDestinationSuggestions(suggestions);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsSearchingDestination(false);
          }
        });
    }, 350);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [activeSuggestionField, destination, getSearchBiasCenter, isLoggedIn]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location access is not supported in this browser.");
      return;
    }

    setLocationStatus("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Number(position.coords.accuracy || 0);

        if (!isUsableGpsPosition(position)) {
          const fallbackOrigin = {
            lat: KHARGONE_CENTER[0],
            lng: KHARGONE_CENTER[1],
            label: "Khargone current area",
            isGpsFallback: true,
          };

          setCurrentLocation(fallbackOrigin.label);
          setSelectedOrigin(fallbackOrigin);
          setLocationStatus(
            `GPS reading looked inaccurate (${formatMeters(accuracy)} accuracy), so Khargone current area was used. You can type your exact pickup if needed.`,
          );

          if (window.L && mapRef.current) {
            mapRef.current.setView([fallbackOrigin.lat, fallbackOrigin.lng], 14);
          }

          readApprovedAccidentReports()
            .then((reports) => setNearbyRisks(findNearbyRisks(fallbackOrigin, reports)))
            .catch(() => setNearbyRisks(findNearbyRisks(fallbackOrigin, [])));
          return;
        }

        const gpsOrigin = { lat, lng, label: "Current location" };
        setCurrentLocation(gpsOrigin.label);
        setSelectedOrigin(gpsOrigin);
        setLocationStatus(`Current location added with ${formatMeters(accuracy)} accuracy.`);

        if (window.L && mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        readApprovedAccidentReports()
          .then((reports) => setNearbyRisks(findNearbyRisks({ lat, lng }, reports)))
          .catch(() => setNearbyRisks(findNearbyRisks({ lat, lng }, [])));
      },
      () => {
        setLocationStatus("Location permission denied. You can enter location manually.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  }

  function clearLiveNavigationMarker() {
    liveNavigationLayerRef.current?.clearLayers();
    liveMarkerRef.current = null;
    liveAccuracyCircleRef.current = null;
  }

  function stopLiveNavigation(message = "Live navigation stopped.", shouldClearMarker = false) {
    if (watchPositionIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }

    setIsLiveTracking(false);
    lastLivePositionRef.current = null;

    if (shouldClearMarker) {
      clearLiveNavigationMarker();
      setNavigationState(null);
    }

    if (message) {
      setLocationStatus(message);
    }
  }

  function updateLiveNavigationMarker(point, accuracy, heading) {
    if (!window.L || !mapRef.current || !liveNavigationLayerRef.current) {
      return;
    }

    const L = window.L;
    const rotation = Number.isFinite(heading) ? heading : 0;
    const icon = L.divIcon({
      className: "live-location-marker",
      html: `<span class="live-location-marker__arrow" style="transform: rotate(${rotation}deg)"></span><span class="live-location-marker__dot"></span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    if (liveMarkerRef.current) {
      liveMarkerRef.current.setLatLng([point.lat, point.lng]);
      liveMarkerRef.current.setIcon(icon);
    } else {
      liveMarkerRef.current = L.marker([point.lat, point.lng], {
        icon,
        zIndexOffset: 1000,
      })
        .addTo(liveNavigationLayerRef.current)
        .bindPopup("Live current location");
    }

    if (liveAccuracyCircleRef.current) {
      liveAccuracyCircleRef.current.setLatLng([point.lat, point.lng]);
      liveAccuracyCircleRef.current.setRadius(Math.max(accuracy, 18));
    } else {
      liveAccuracyCircleRef.current = L.circle([point.lat, point.lng], {
        radius: Math.max(accuracy, 18),
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.12,
        opacity: 0.32,
        weight: 1.5,
        interactive: false,
      }).addTo(liveNavigationLayerRef.current);
    }
  }

  function updateLiveNavigationPosition(position) {
    const point = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    const accuracy = Number(position.coords.accuracy || 0);

    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
      return;
    }

    if (accuracy > MAX_WEAK_GPS_ACCURACY_METERS) {
      setLocationStatus(`GPS signal is too weak (${formatMeters(accuracy)} accuracy).`);
      return;
    }

    const now = Number(position.timestamp || Date.now());
    const previousPosition = lastLivePositionRef.current;
    const fallbackSpeed =
      previousPosition && now > previousPosition.time
        ? distanceInMeters(previousPosition.point, point) / ((now - previousPosition.time) / 1000)
        : 0;
    const reportedSpeed = Number(position.coords.speed);
    const speedMetersPerSecond =
      Number.isFinite(reportedSpeed) && reportedSpeed > 0 ? reportedSpeed : fallbackSpeed;
    const heading = Number.isFinite(position.coords.heading)
      ? Number(position.coords.heading)
      : previousPosition && distanceInMeters(previousPosition.point, point) > 3
        ? getBearing(previousPosition.point, point)
        : null;
    const summary = routeSummaryRef.current;
    const progress = summary?.routeLatLngs?.length
      ? getRouteProgress(point, summary.routeLatLngs)
      : null;
    const etaSpeed = speedMetersPerSecond > 1 ? speedMetersPerSecond : summary?.routeAverageSpeed || 8;
    const remainingDuration = progress ? progress.remainingDistance / etaSpeed : null;

    updateLiveNavigationMarker(point, accuracy, heading);
    setSelectedOrigin({ ...point, label: "Live current location" });

    if (progress?.remainingLatLngs?.length > 1 && routeLayerRef.current) {
      routeLayerRef.current.setLatLngs(progress.remainingLatLngs);
    }

    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setView([point.lat, point.lng], Math.max(currentZoom, 16), {
        animate: true,
        duration: 0.6,
      });
    }

    if (now - nearbyRiskRefreshAtRef.current > LIVE_NAVIGATION_NEARBY_RISK_REFRESH_MS) {
      nearbyRiskRefreshAtRef.current = now;
      readApprovedAccidentReports()
        .then((reports) => setNearbyRisks(findNearbyRisks(point, reports)))
        .catch(() => setNearbyRisks(findNearbyRisks(point, [])));
    }

    setNavigationState({
      accuracy,
      distanceFromRoute: progress?.distanceFromRoute ?? null,
      isOffRoute: Boolean(progress && progress.distanceFromRoute > LIVE_NAVIGATION_OFF_ROUTE_METERS),
      remainingDistance: progress?.remainingDistance ?? null,
      remainingDuration,
      speedMetersPerSecond,
      updatedAt: now,
    });
    setLocationStatus(
      progress && progress.distanceFromRoute > LIVE_NAVIGATION_OFF_ROUTE_METERS
        ? `Live navigation running. You look ${formatMeters(progress.distanceFromRoute)} away from the route.`
        : `Live navigation running at ${formatSpeed(speedMetersPerSecond)}.`,
    );
    lastLivePositionRef.current = { point, time: now };
  }

  function startLiveNavigation(routeSummaryOverride = null) {
    if (!navigator.geolocation) {
      setLocationStatus("Location access is not supported in this browser.");
      return;
    }

    const summary = routeSummaryOverride || routeSummaryRef.current;

    if (!summary?.routeLatLngs?.length) {
      setFormError("Show a route first to start live navigation.");
      return;
    }

    if (watchPositionIdRef.current !== null) {
      return;
    }

    routeSummaryRef.current = summary;
    setFormError("");
    setIsLiveTracking(true);
    setLocationStatus("Route found. Live navigation is starting...");
    setNavigationState((current) => current || { speedMetersPerSecond: 0 });

    watchPositionIdRef.current = navigator.geolocation.watchPosition(
      updateLiveNavigationPosition,
      () => stopLiveNavigation("Location permission denied. Live navigation stopped."),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );
  }

  function selectSuggestion(field, suggestion) {
    const value = suggestion.label;

    if (field === "origin") {
      setCurrentLocation(value);
      setSelectedOrigin({
        lat: suggestion.lat,
        lng: suggestion.lng,
        label: suggestion.label,
      });
      setOriginSuggestions([]);
    } else {
      setDestination(value);
      setSelectedDestination({
        lat: suggestion.lat,
        lng: suggestion.lng,
        label: suggestion.label,
      });
      setDestinationSuggestions([]);
    }

    setActiveSuggestionField("");

    if (window.L && mapRef.current) {
      mapRef.current.setView([suggestion.lat, suggestion.lng], 14);
    }
  }

  function renderRouteOnMap(summary) {
    if (!summary || !window.L || !mapRef.current) {
      return;
    }

    const L = window.L;
    const metaForRoute = getRouteTypeMeta(summary.routeType);

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    markerLayerRef.current.clearLayers();
    blackspotLayerRef.current.clearLayers();
    dangerSegmentLayerRef.current.clearLayers();
    emergencyLayerRef.current?.clearLayers();

    L.marker([summary.origin.lat, summary.origin.lng])
      .addTo(markerLayerRef.current)
      .bindPopup("Current location");
    L.marker([summary.destination.lat, summary.destination.lng])
      .addTo(markerLayerRef.current)
      .bindPopup("Destination");

    clusterBlackspots(summary.blackspots).forEach((cluster) => {
      if (cluster.items.length < 2) {
        return;
      }

      const highest = cluster.items.reduce((current, item) => {
        return getSeverityMeta(item.severity).order < getSeverityMeta(current.severity).order ? item : current;
      }, cluster.items[0]);
      const meta = getSeverityMeta(highest.severity);
      const icon = L.divIcon({
        className: "route-risk-cluster",
        html: `<span style="background:${meta.color}">${cluster.items.length}</span>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      L.marker([cluster.center.lat, cluster.center.lng], { icon })
        .addTo(blackspotLayerRef.current)
        .bindPopup(
          `<div class="route-risk-popup"><strong>${cluster.items.length} nearby blackspots</strong><p>${escapeHtml(
            cluster.items.map((item) => item.location).join(", "),
          )}</p></div>`,
        );
    });

    summary.blackspots.forEach((blackspot) => {
      const style = getSeverityStyle(blackspot.severity);
      const meta = getSeverityMeta(blackspot.severity);
      const verification = getVerificationMeta(blackspot.verificationStatus);
      const pulseClass = normalizeSafety(blackspot.severity) === "high" ? " route-risk-pulse" : "";
      const icon = L.divIcon({
        className: `route-risk-dot${pulseClass}`,
        html: `<span style="background:${style.fillColor}; box-shadow:0 0 0 9px ${meta.softColor}, 0 0 28px ${style.fillColor}"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const createdDate = blackspot.createdAt
        ? new Date(blackspot.createdAt).toLocaleDateString()
        : "Not available";

      L.circle([blackspot.lat, blackspot.lng], {
        radius: meta.radius,
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: 0.16,
        weight: 2,
        className: "route-risk-circle",
      }).addTo(blackspotLayerRef.current);

      L.marker([blackspot.lat, blackspot.lng], { icon })
        .addTo(blackspotLayerRef.current)
        .bindPopup(
          `<div class="route-risk-popup route-risk-popup--details">
            <strong>${escapeHtml(blackspot.location || "Black spot")}</strong>
            <span>Severity: ${escapeHtml(blackspot.severity || "Medium")}</span>
            <span>Accidents: ${Number(blackspot.accidentFrequency || 1)}</span>
            <span>Coordinates: ${Number(blackspot.lat).toFixed(5)}, ${Number(blackspot.lng).toFixed(5)}</span>
            <p>${escapeHtml(blackspot.description || "No description available.")}</p>
            <span>Date added: ${escapeHtml(createdDate)}</span>
            <span>${Math.round(blackspot.distanceFromRoute)} m from route</span>
            <span>${verification.label} / ${Number(blackspot.confidenceScore || 60)}% confidence</span>
          </div>`,
        );
    });

    routeLayerRef.current = L.polyline(summary.routeLatLngs, {
      color: metaForRoute.lineColor,
      opacity: 0.78,
      weight: 6,
      lineCap: "round",
    }).addTo(mapRef.current);

    summary.dangerousSegments.forEach((segment) => {
      const style = getSeverityStyle(segment.severity);

      L.polyline(segment.points, {
        color: style.color,
        opacity: 0.95,
        weight: normalize(segment.severity) === "high" ? 10 : 8,
        lineCap: "round",
      }).addTo(dangerSegmentLayerRef.current);
    });

    mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
      padding: [34, 34],
    });
  }

  function selectRouteOption(option) {
    stopLiveNavigation("", true);
    setEmergencyServices([]);
    setEmergencyStatus("");
    setEmergencyError("");
    setSelectedRouteType(option.routeType);
    setRouteSummary(option);
    renderRouteOnMap(option);
    startLiveNavigation(option);
  }

  async function submitRoute(event) {
    event.preventDefault();

    if (!currentLocation.trim() || !destination.trim()) {
      setFormError("Current location and destination both are required.");
      return;
    }

    if (!isMapReady || !window.L || !mapRef.current) {
      setFormError("Map is not ready yet.");
      return;
    }

    setFormError("");
    stopLiveNavigation("", true);
    setRouteSummary(null);
    setRouteOptions([]);
    setEmergencyServices([]);
    emergencyLayerRef.current?.clearLayers();
    markerLayerRef.current?.clearLayers();
    blackspotLayerRef.current?.clearLayers();
    dangerSegmentLayerRef.current?.clearLayers();
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setIsRouteLoading(true);

    try {
      const shouldUseSelectedOrigin =
        selectedOrigin?.label === currentLocation || selectedOrigin?.label === "Live current location";
      const [origin, destinationPoint] = await Promise.all([
        shouldUseSelectedOrigin ? selectedOrigin : geocodeLocation(currentLocation),
        selectedDestination?.label === destination ? selectedDestination : geocodeLocation(destination),
      ]);
      const corridorWaypoints = getKhargoneIndoreCorridorWaypoints(origin, destinationPoint);
      const carRoutes = await fetchRoutes(origin, destinationPoint, "driving", corridorWaypoints, true);
      const bikeRoute = await fetchBikeRoute(origin, destinationPoint, carRoutes[0], corridorWaypoints);
      const approvedReports = await readApprovedAccidentReports().catch(() => []);
      const candidates = carRoutes.slice(0, 3).map((route, index) => {
        const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const routePoints = latLngs.map(([lat, lng]) => ({ lat, lng }));
        const routeBlackspots = getRouteBlackspots(routePoints, approvedReports);
        const safety = calculateRouteSafety(routeBlackspots, route.distance);
        const dangerousSegments = getDangerousRouteSegments(routePoints, routeBlackspots);

        return {
          id: `route-${index}`,
          from: origin.label,
          to: destinationPoint.label,
          routeMode: corridorWaypoints.length ? "Khargone-Indore highway corridor" : "OSRM route option",
          car: {
            distance: formatDistance(route.distance),
            duration: formatDuration(route.duration),
          },
          bike: {
            distance: formatDistance(bikeRoute.distance),
            duration: `${bikeRoute.isEstimate ? "~" : ""}${formatDuration(bikeRoute.duration)}`,
            isEstimate: Boolean(bikeRoute.isEstimate),
          },
          distance: route.distance,
          duration: route.duration,
          blackspots: routeBlackspots,
          safety,
          origin,
          destination: destinationPoint,
          routeLatLngs: latLngs,
          dangerousSegments,
          routeDistanceMeters: route.distance,
          routeDurationSeconds: route.duration,
          routeAverageSpeed: route.duration > 0 ? route.distance / route.duration : 8,
          blackSpotCount: routeBlackspots.length,
        };
      });
      const options = pickRouteOptions(candidates);
      const preferred = options.find((option) => option.routeType === "balanced") || options[0];

      setRouteOptions(options);
      setSelectedRouteType(preferred.routeType);
      setRouteSummary(preferred);
      renderRouteOnMap(preferred);
      startLiveNavigation(preferred);

      recordRouteHistory({
        source: origin,
        destination: destinationPoint,
        safetyScore: preferred.safety.safetyScore,
        routeType: preferred.routeType,
        distanceMeters: preferred.routeDistanceMeters,
        durationSeconds: preferred.routeDurationSeconds,
        blackSpotCount: preferred.blackSpotCount,
      })
        .then(() => listRouteHistory({ page: 1 }))
        .then((data) => {
          setHistoryPage(1);
          setRouteHistory(data.history || []);
          setHistoryPagination(data.pagination || null);
        })
        .catch(() => {});
    } catch (error) {
      setFormError(error.message || "Route not found. Try a more specific location.");
    } finally {
      setIsRouteLoading(false);
    }
  }

  async function refreshSavedRoutes() {
    const data = await listSavedRoutes({ page: routePage, search: routeSearch });
    setSavedRoutes(data.routes || []);
    setSavedPagination(data.pagination || null);
  }

  async function handleSaveRoute(option) {
    if (!option) {
      return;
    }

    setSavingRouteType(option.routeType);
    setRouteDataError("");
    setRouteDataStatus("");

    try {
      const meta = getRouteTypeMeta(option.routeType);
      await saveRoute({
        routeName: `${meta.label}: ${option.from} to ${option.to}`.slice(0, 80),
        source: option.origin,
        destination: option.destination,
        safetyScore: option.safety.safetyScore,
        routeType: option.routeType,
        distanceMeters: option.routeDistanceMeters,
        durationSeconds: option.routeDurationSeconds,
        blackSpotCount: option.blackSpotCount,
      });
      await refreshSavedRoutes();
      setRouteDataStatus("Route saved.");
    } catch (error) {
      setRouteDataError(error.message || "Could not save route.");
    } finally {
      setSavingRouteType("");
    }
  }

  async function handleRenameSavedRoute(routeId) {
    const routeName = editingRouteName.trim();

    if (routeName.length < 2) {
      setRouteDataError("Route name must be at least 2 characters.");
      return;
    }

    try {
      await renameSavedRoute(routeId, routeName);
      setEditingRouteId("");
      setEditingRouteName("");
      await refreshSavedRoutes();
      setRouteDataStatus("Route renamed.");
    } catch (error) {
      setRouteDataError(error.message || "Could not rename route.");
    }
  }

  async function handleDeleteSavedRoute(routeId) {
    try {
      await deleteSavedRoute(routeId);
      await refreshSavedRoutes();
      setRouteDataStatus("Route deleted.");
    } catch (error) {
      setRouteDataError(error.message || "Could not delete route.");
    }
  }

  async function handleClearHistory() {
    try {
      await clearRouteHistory();
      setHistoryPage(1);
      setRouteHistory([]);
      setHistoryPagination({ page: 1, limit: 8, total: 0, pages: 0 });
      setRouteDataStatus("Route history cleared.");
    } catch (error) {
      setRouteDataError(error.message || "Could not clear route history.");
    }
  }

  function renderEmergencyMarkers(services) {
    if (!window.L || !emergencyLayerRef.current) {
      return;
    }

    const L = window.L;
    emergencyLayerRef.current.clearLayers();

    services.forEach((service) => {
      const isHospital = service.type === "hospital";
      const color = isHospital ? "#0ea5e9" : "#7c3aed";
      const icon = L.divIcon({
        className: `emergency-marker emergency-marker--${service.type}`,
        html: `<span style="background:${color}">${isHospital ? "H" : "P"}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([service.lat, service.lng], { icon })
        .addTo(emergencyLayerRef.current)
        .bindPopup(
          `<div class="route-risk-popup">
            <strong>${escapeHtml(service.name)}</strong>
            <span>${isHospital ? "Hospital" : "Police Station"}</span>
            ${service.address ? `<p>${escapeHtml(service.address)}</p>` : ""}
            <span>${formatMeters(service.distanceFromRouteMeters ?? service.distanceFromCenterMeters)} from route</span>
            ${service.phone ? `<span>${escapeHtml(service.phone)}</span>` : ""}
          </div>`,
        );
    });
  }

  async function loadEmergencyServices() {
    if (!routeSummary?.routeLatLngs?.length) {
      setEmergencyError("Show a route first.");
      return;
    }

    const types = [
      showHospitals ? "hospital" : "",
      showPolice ? "police" : "",
    ].filter(Boolean);

    if (!types.length) {
      setEmergencyServices([]);
      emergencyLayerRef.current?.clearLayers();
      return;
    }

    setEmergencyStatus("Finding nearby emergency services...");
    setEmergencyError("");

    try {
      const sampledRoutePoints = routeSummary.routeLatLngs
        .filter((_, index) => index % 8 === 0)
        .map(([lat, lng]) => ({ lat, lng }));
      const data = await findEmergencyServices({
        routePoints: sampledRoutePoints,
        radiusMeters: emergencyRadius,
        types,
      });
      const services = data.services || [];

      setEmergencyServices(services);
      renderEmergencyMarkers(services);
      setEmergencyStatus(data.fallback ? "Showing local fallback emergency services." : "Emergency services loaded.");
    } catch (error) {
      setEmergencyError(error.message || "Emergency services are unavailable.");
      setEmergencyStatus("");
    }
  }

  function openInOpenStreetMap() {
    if (!routeSummary) {
      return;
    }

    const { origin, destination: destinationPoint } = routeSummary;
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat}%2C${origin.lng}%3B${destinationPoint.lat}%2C${destinationPoint.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!isLoggedIn) {
    return (
      <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-12 text-[#173a0b] sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#e5eedf] shadow-[0_24px_60px_rgba(16,47,0,0.1)] lg:grid-cols-[1fr_0.86fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="mb-6 grid size-12 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
              <Icon name="lock" className="size-6" strokeWidth={2.4} />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              Route planning access
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl">
              Login required to plan routes.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#46623d]">
              Sign in to use your current location and get driving directions between pickup
              and destination.
            </p>
          </div>

          <div className="grid content-center bg-[#fbfcfa] p-6 sm:p-8 lg:p-10">
            <div className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_42px_rgba(16,47,0,0.08)]">
              <span className="grid size-11 place-items-center rounded-lg bg-[#f1f6f0] text-[#173a0b]">
                <Icon name="route" className="size-5" strokeWidth={2.4} />
              </span>
              <h2 className="mt-5 text-2xl font-black text-[#173a0b]">Continue to RouteRaksha</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                Your account keeps route planning access connected.
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  to="/login"
                  className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white transition hover:bg-[#102f00]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="motion-page bg-[#fbfcfa] text-[#113006]">
      <section className="bg-[#e5eedf] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#173a0b]">
            Plan Route
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl">
            Select pickup and destination to view the route.
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#46623d] sm:text-base">
            This uses OpenStreetMap routing and RouteRaksha's Madhya Pradesh blackspot layer.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <aside className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_45px_rgba(16,47,0,0.08)] sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
              <Icon name="route" className="size-5" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="text-2xl font-black text-[#173a0b]">Where are you going?</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                Type a city, landmark, full address, or use GPS for pickup.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={submitRoute}>
            <label className="grid gap-2 text-sm font-black text-[#173a0b]">
              Current location
              <div className="relative flex gap-2">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#f1f6f0] text-[#173a0b]">
                  <Icon name="crosshair" className="size-5" />
                </span>
                <input
                  value={currentLocation}
                  onChange={(event) => {
                    setCurrentLocation(event.target.value);
                    setSelectedOrigin(null);
                    setActiveSuggestionField("origin");
                  }}
                  onFocus={() => setActiveSuggestionField("origin")}
                  onBlur={() => window.setTimeout(() => setActiveSuggestionField(""), 120)}
                  placeholder="Use GPS or type pickup location"
                  className="min-h-12 w-full rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                />
                {activeSuggestionField === "origin" && (
                  <LocationSuggestions
                    suggestions={originSuggestions}
                    isSearching={isSearchingOrigin}
                    onSelect={(suggestion) => selectSuggestion("origin", suggestion)}
                  />
                )}
              </div>
            </label>

            <label className="grid gap-2 text-sm font-black text-[#173a0b]">
              Destination
              <div className="relative flex gap-2">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <Icon name="mapPin" className="size-5" />
                </span>
                <input
                  value={destination}
                  onChange={(event) => {
                    setDestination(event.target.value);
                    setSelectedDestination(null);
                    setActiveSuggestionField("destination");
                  }}
                  onFocus={() => setActiveSuggestionField("destination")}
                  onBlur={() => window.setTimeout(() => setActiveSuggestionField(""), 120)}
                  placeholder="Type destination"
                  className="min-h-12 w-full rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                />
                {activeSuggestionField === "destination" && (
                  <LocationSuggestions
                    suggestions={destinationSuggestions}
                    isSearching={isSearchingDestination}
                    onSelect={(suggestion) => selectSuggestion("destination", suggestion)}
                  />
                )}
              </div>
            </label>

            {locationStatus && (
              <p className="rounded-lg border border-[#9cec6d] bg-[#efffe8] px-4 py-3 text-sm font-bold text-[#173a0b]">
                {locationStatus}
              </p>
            )}

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {formError}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
              >
                <Icon name="crosshair" className="size-4" />
                Use GPS
              </button>
              <button
                type="submit"
                disabled={isRouteLoading}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(16,47,0,0.18)] transition hover:bg-[#102f00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon name="navigation" className="size-4" />
                {isRouteLoading ? "Finding route..." : "Show route"}
              </button>
            </div>
          </form>

          {isRouteLoading && (
            <div className="mt-5 grid gap-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-lg border border-[#d8e5d3] bg-[#f1f6f0]" />
              ))}
            </div>
          )}

          {!isRouteLoading && routeOptions.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[#173a0b]">Compare routes</p>
                <span className="rounded-full border border-[#d8e5d3] bg-white px-3 py-1 text-[11px] font-black text-[#46623d]">
                  {routeOptions.length} options
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                {routeOptions.map((option) => {
                  const meta = getRouteTypeMeta(option.routeType);
                  const isSelected = selectedRouteType === option.routeType;

                  return (
                    <article
                      key={option.routeType}
                      className={`rounded-lg border bg-white p-4 transition ${
                        isSelected ? "border-[#173a0b] shadow-[0_16px_34px_rgba(16,47,0,0.12)]" : "border-[#d8e5d3]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}>
                            {meta.badge}
                          </span>
                          <h3 className="mt-2 text-base font-black text-[#173a0b]">{meta.label}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectRouteOption(option)}
                          className="min-h-9 rounded-full border border-[#173a0b] px-3 text-xs font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
                        >
                          {isSelected ? "Selected" : "View"}
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-[#f7faf6] p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Distance</p>
                          <p className="mt-1 text-sm font-black text-[#173a0b]">{option.car.distance}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf6] p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Time</p>
                          <p className="mt-1 text-sm font-black text-[#173a0b]">{option.car.duration}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf6] p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Safety</p>
                          <p className="mt-1 text-sm font-black text-[#173a0b]">{option.safety.safetyScore}/100</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf6] p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Black Spots</p>
                          <p className="mt-1 text-sm font-black text-[#173a0b]">{option.blackSpotCount}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveRoute(option)}
                        disabled={savingRouteType === option.routeType}
                        className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#173a0b] px-4 text-xs font-black text-white transition hover:bg-[#102f00] disabled:opacity-70"
                      >
                        <Icon name="save" className="size-4" />
                        {savingRouteType === option.routeType ? "Saving..." : "Save route"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {routeSummary && (
            <div className="mt-5 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#46623d]">
                Route summary
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-[#78936d]">By car</p>
                  <p className="text-lg font-black text-[#173a0b]">{routeSummary.car.duration}</p>
                  <p className="mt-1 text-xs font-bold text-[#46623d]">{routeSummary.car.distance}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-[#78936d]">By bike</p>
                  <p className="text-lg font-black text-[#173a0b]">{routeSummary.bike.duration}</p>
                  <p className="mt-1 text-xs font-bold text-[#46623d]">{routeSummary.bike.distance}</p>
                  {routeSummary.bike.isEstimate && (
                    <p className="mt-1 text-[11px] font-bold text-amber-700">Estimated</p>
                  )}
                </div>
              </div>
              {routeSummary.routeMode && (
                <p className="mt-3 rounded-lg border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-bold text-[#46623d]">
                  Distance is calculated from selected pins using {routeSummary.routeMode}.
                </p>
              )}

              <div className="mt-4 rounded-lg border border-[#d8e5d3] bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#173a0b]">Live navigation</p>
                    <p className="mt-1 text-xs font-bold text-[#46623d]">
                      {isLiveTracking ? "Tracking your movement on this route." : "Starts automatically when the route is ready."}
                    </p>
                  </div>
                  {isLiveTracking ? (
                    <button
                      type="button"
                      onClick={() => stopLiveNavigation()}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      <Icon name="stopCircle" className="size-4" />
                      Stop live
                    </button>
                  ) : (
                    <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-4 text-xs font-black text-[#46623d]">
                      Auto-start
                    </span>
                  )}
                </div>

                {navigationState && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-[#f1f6f0] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Speed</p>
                      <p className="mt-1 text-base font-black text-[#173a0b]">
                        {formatSpeed(navigationState.speedMetersPerSecond)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#f1f6f0] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Remaining</p>
                      <p className="mt-1 text-base font-black text-[#173a0b]">
                        {navigationState.remainingDistance == null
                          ? "--"
                          : formatDistance(navigationState.remainingDistance)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#f1f6f0] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">ETA</p>
                      <p className="mt-1 text-base font-black text-[#173a0b]">
                        {navigationState.remainingDuration == null
                          ? "--"
                          : formatDuration(navigationState.remainingDuration)}
                      </p>
                    </div>
                  </div>
                )}

                {navigationState?.isOffRoute && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    You are {formatMeters(navigationState.distanceFromRoute)} away from the planned route.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-[#d8e5d3] bg-white p-3">
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  <div className="min-w-0 rounded-lg bg-[#f1f6f0] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Danger score</p>
                    <p className="mt-1 text-lg font-black tabular-nums leading-tight text-[#173a0b]">
                      {routeSummary.safety.dangerScore}/100
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg bg-[#f1f6f0] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Safety level</p>
                    <p className="mt-1 truncate text-lg font-black leading-tight text-[#173a0b]">
                      {routeSummary.safety.safetyLevel}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg bg-[#f1f6f0] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#78936d]">Severity mix</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700">
                        H {routeSummary.safety.breakdown.high}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700">
                        M {routeSummary.safety.breakdown.medium}
                      </span>
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-black text-yellow-700">
                        L {routeSummary.safety.breakdown.low}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#173a0b]">Blackspots on this route</p>
                  <span className="rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-black text-[#46623d]">
                    {routeSummary.blackspots.length}
                  </span>
                </div>

                {routeSummary.blackspots.length ? (
                  <div className="mt-3 grid gap-2">
                    {routeSummary.blackspots.map((blackspot) => {
                      const style = getSeverityStyle(blackspot.severity);

                      return (
                        <div
                          key={blackspot.id}
                          className="rounded-lg border border-[#e1eadc] bg-[#fbfcfa] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-[#173a0b]">
                                {blackspot.location}
                              </p>
                              <p className="mt-1 text-xs font-bold text-[#46623d]">
                                {Math.round(blackspot.distanceFromRoute)} m from route
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${style.className}`}>
                              {blackspot.severity}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getVerificationMeta(blackspot.verificationStatus).className}`}>
                              {getVerificationMeta(blackspot.verificationStatus).label}
                            </span>
                            <span className="rounded-full border border-[#d8e5d3] bg-white px-2.5 py-1 text-[11px] font-black text-[#46623d]">
                              {blackspot.confidenceScore || 60}% confidence
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                    No approved blackspots found near this route.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={openInOpenStreetMap}
                className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
              >
                Open in OpenStreetMap
              </button>

              <div className="mt-4 rounded-lg border border-[#d8e5d3] bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#173a0b]">Nearby emergency services</p>
                    <p className="mt-1 text-xs font-bold text-[#46623d]">
                      Hospitals and police stations near this route.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadEmergencyServices}
                    className="min-h-10 rounded-full bg-[#173a0b] px-4 text-xs font-black text-white transition hover:bg-[#102f00]"
                  >
                    Search
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-xs font-black text-[#173a0b]">
                    <input
                      type="checkbox"
                      checked={showHospitals}
                      onChange={(event) => setShowHospitals(event.target.checked)}
                    />
                    Hospitals
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-xs font-black text-[#173a0b]">
                    <input
                      type="checkbox"
                      checked={showPolice}
                      onChange={(event) => setShowPolice(event.target.checked)}
                    />
                    Police
                  </label>
                  <label className="grid gap-1 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-xs font-black text-[#173a0b]">
                    Radius
                    <select
                      value={emergencyRadius}
                      onChange={(event) => setEmergencyRadius(Number(event.target.value))}
                      className="rounded-md border border-[#cddcc7] bg-white px-2 py-1 text-xs font-bold"
                    >
                      <option value={3000}>3 km</option>
                      <option value={5000}>5 km</option>
                      <option value={10000}>10 km</option>
                    </select>
                  </label>
                </div>
                {emergencyStatus && (
                  <p className="mt-3 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-xs font-bold text-[#46623d]">
                    {emergencyStatus}
                  </p>
                )}
                {emergencyError && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    {emergencyError}
                  </p>
                )}
                {emergencyServices.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {emergencyServices.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-start justify-between gap-3 rounded-lg bg-[#f7faf6] p-3">
                        <div>
                          <p className="text-sm font-black text-[#173a0b]">{service.name}</p>
                          <p className="mt-1 text-xs font-bold text-[#46623d]">
                            {service.type === "hospital" ? "Hospital" : "Police Station"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#46623d]">
                          {formatMeters(service.distanceFromRouteMeters ?? service.distanceFromCenterMeters)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-black text-[#173a0b]">Saved routes</p>
              <input
                value={routeSearch}
                onChange={(event) => {
                  setRoutePage(1);
                  setRouteSearch(event.target.value);
                }}
                placeholder="Search"
                className="min-h-9 rounded-full border border-[#cddcc7] bg-white px-3 text-xs font-bold text-[#173a0b] outline-none focus:border-[#173a0b]"
              />
            </div>
            {routeDataStatus && (
              <p className="mt-3 rounded-lg border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-bold text-[#46623d]">
                {routeDataStatus}
              </p>
            )}
            {routeDataError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {routeDataError}
              </p>
            )}
            <div className="mt-3 grid gap-2">
              {savedRoutes.length ? (
                savedRoutes.map((route) => {
                  const meta = getRouteTypeMeta(route.routeType);
                  const isEditing = editingRouteId === route.id;

                  return (
                    <div key={route.id} className="rounded-lg bg-white p-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            value={editingRouteName}
                            onChange={(event) => setEditingRouteName(event.target.value)}
                            className="min-h-10 min-w-0 flex-1 rounded-lg border border-[#cddcc7] px-3 text-sm font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameSavedRoute(route.id)}
                            className="rounded-full bg-[#173a0b] px-3 text-xs font-black text-white"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-[#173a0b]">{route.routeName}</p>
                              <p className="mt-1 text-xs font-bold text-[#46623d]">
                                {route.source.label} to {route.destination.label}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}>
                              {meta.badge}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-[#46623d]">
                            <span className="rounded-full bg-[#f1f6f0] px-2.5 py-1">{route.safetyScore}/100 safety</span>
                            <span className="rounded-full bg-[#f1f6f0] px-2.5 py-1">{formatDistance(route.distanceMeters)}</span>
                            <span className="rounded-full bg-[#f1f6f0] px-2.5 py-1">{formatDuration(route.durationSeconds)}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRouteId(route.id);
                                setEditingRouteName(route.routeName);
                              }}
                              className="grid size-9 place-items-center rounded-full border border-[#d8e5d3] text-[#173a0b]"
                              aria-label="Rename saved route"
                            >
                              <Icon name="edit" className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedRoute(route.id)}
                              className="grid size-9 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
                              aria-label="Delete saved route"
                            >
                              <Icon name="trash" className="size-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-semibold leading-6 text-[#46623d]">
                  Save a route to keep it here.
                </p>
              )}
            </div>
            {savedPagination?.pages > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={routePage <= 1}
                  onClick={() => setRoutePage((page) => Math.max(1, page - 1))}
                  className="rounded-full border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-black text-[#46623d] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-black text-[#46623d]">
                  Page {savedPagination.page} of {savedPagination.pages}
                </span>
                <button
                  type="button"
                  disabled={routePage >= savedPagination.pages}
                  onClick={() => setRoutePage((page) => page + 1)}
                  className="rounded-full border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-black text-[#46623d] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#173a0b]">
                Route history
                {historyPagination?.total ? (
                  <span className="ml-2 text-xs font-bold text-[#78936d]">({historyPagination.total})</span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-full border border-[#d8e5d3] bg-white px-3 py-1.5 text-xs font-black text-[#46623d]"
              >
                Clear
              </button>
            </div>
            {routeHistory.length ? (
              <div className="mt-3 grid gap-2">
                {routeHistory.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white p-3">
                    <p className="text-sm font-black text-[#173a0b]">
                      {item.source.label} to {item.destination.label}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#46623d]">
                      {getRouteTypeMeta(item.routeType).label} / {item.safetyScore}/100 /{" "}
                      {new Date(item.searchedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-[#46623d]">
                Your latest searches will appear here.
              </p>
            )}
            {historyPagination?.pages > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                  className="rounded-full border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-black text-[#46623d] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-black text-[#46623d]">
                  Page {historyPagination.page} of {historyPagination.pages}
                </span>
                <button
                  type="button"
                  disabled={historyPage >= historyPagination.pages}
                  onClick={() => setHistoryPage((page) => page + 1)}
                  className="rounded-full border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-black text-[#46623d] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#173a0b]">Dangerous Areas Near You</p>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="rounded-full border border-[#d8e5d3] bg-white px-3 py-1.5 text-xs font-black text-[#46623d]"
              >
                Refresh
              </button>
            </div>
            {nearbyRisks.length ? (
              <div className="mt-3 grid gap-2">
                {nearbyRisks.map((risk) => (
                  <div key={risk.id} className="flex items-start justify-between gap-3 rounded-lg bg-white p-3">
                    <div>
                      <p className="text-sm font-black text-[#173a0b]">{risk.location}</p>
                      <p className="mt-1 text-xs font-bold text-[#46623d]">{getSeverityMeta(risk.severity).label}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-black text-[#46623d]">
                      {formatMeters(risk.distanceFromUser)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-[#46623d]">
                Use GPS to sort Madhya Pradesh blackspots by distance from your location.
              </p>
            )}
          </div>
        </aside>

        <section className="rounded-lg border border-[#d8e5d3] bg-white p-4 shadow-[0_22px_55px_rgba(16,47,0,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
                OpenStreetMap
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#173a0b]">
                {routeSummary ? "Driving route" : "Search a route"}
              </h2>
            </div>
            <span className="rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-4 py-2 text-sm font-black text-[#46623d]">
              {isMapReady ? "Map ready" : "Loading map"}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 px-1">
            {Object.entries(severityStyles).map(([severity, style]) => (
              <span
                key={severity}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-3 py-1.5 text-xs font-black text-[#46623d]"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: style.fillColor }}
                />
                {style.label}
              </span>
            ))}
          </div>

          <div className="relative min-h-[34rem] overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#e5eedf]">
            <div ref={mapElementRef} className="dark-leaflet-map absolute inset-0" />

            {mapError && (
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="max-w-md rounded-lg border border-[#d8e5d3] bg-[#fbfcfa]/95 p-6 text-center shadow-[0_18px_42px_rgba(16,47,0,0.12)]">
                  <span className="mx-auto mb-4 grid size-14 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name="route" className="size-7" />
                  </span>
                  <h3 className="text-xl font-black text-[#173a0b]">Map setup issue</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#46623d]">
                    {mapError}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default RoutePlanner;
