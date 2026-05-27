const KHARGONE_PROXIMITY = {
  lat: 21.8257,
  lng: 75.6132,
};
const CACHE_TTL = 5 * 60 * 1000;
const placeCache = new Map();
const localPlaces = [
  {
    id: "local-radha-vallabh-market-khargone",
    label: "Radha Vallabh Market, Jawahar Nagar, Khargone, Madhya Pradesh 451001",
    lat: 21.8259,
    lng: 75.6132,
    type: "Market",
    source: "local",
    keywords: [
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
  },
  {
    id: "local-indore-city",
    label: "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    type: "City",
    source: "local",
    keywords: ["indore", "indore city", "indor", "indore madhya pradesh"],
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function compactSearchValue(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ");
}

function getLocalMatches(query) {
  const compactQuery = compactSearchValue(query);

  if (!compactQuery) {
    return [];
  }

  return localPlaces.filter((place) => {
    return place.keywords.some((keyword) => {
      const compactKeyword = compactSearchValue(keyword);
      return compactQuery.includes(compactKeyword) || compactKeyword.includes(compactQuery);
    });
  });
}

function getPlaceType(properties) {
  return (
    properties.result_type ||
    properties.datasource?.sourcename ||
    properties.category ||
    properties.place_type ||
    "Place"
  );
}

function normalizeFeature(feature) {
  const properties = feature.properties || {};

  return {
    id: properties.place_id || properties.datasource?.raw?.osm_id || properties.formatted,
    label: properties.formatted || properties.address_line1 || properties.name,
    lat: Number(properties.lat),
    lng: Number(properties.lon),
    type: getPlaceType(properties),
    city: properties.city || properties.town || properties.village || properties.county || "",
    state: properties.state || "",
    country: properties.country || "",
    source: "geoapify",
  };
}

function mergeSuggestions(localMatches, remoteSuggestions) {
  const unique = new Map();

  localMatches.forEach((item) => unique.set(item.id, item));
  remoteSuggestions.forEach((item) => {
    const key = `${item.label}-${item.lat.toFixed(5)}-${item.lng.toFixed(5)}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values());
}

async function searchPlaces(req, res) {
  const query = String(req.query.q || "").trim();
  const apiKey = process.env.GEOAPIFY_API_KEY;
  const localMatches = getLocalMatches(query);

  if (query.length < 2) {
    return res.json({ ok: true, suggestions: [] });
  }

  if (!apiKey) {
    if (localMatches.length) {
      return res.json({ ok: true, suggestions: localMatches, localOnly: true });
    }

    return res.status(500).json({
      ok: false,
      message: "Geoapify API key is missing. Add GEOAPIFY_API_KEY in server/.env.",
    });
  }

  const lat = Number(req.query.lat) || KHARGONE_PROXIMITY.lat;
  const lng = Number(req.query.lng) || KHARGONE_PROXIMITY.lng;
  const cacheKey = `${normalize(query)}:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const cached = placeCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
    return res.json({ ok: true, suggestions: cached.suggestions, cached: true });
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", query);
  url.searchParams.set("filter", "countrycode:in");
  url.searchParams.set("bias", `proximity:${lng},${lat}`);
  url.searchParams.set("limit", "8");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("lang", "en");
  url.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: data.message || "Geoapify place search failed.",
      });
    }

    const seen = new Set();
    const suggestions = (data.features || [])
      .map(normalizeFeature)
      .filter((item) => item.label && Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .filter((item) => {
        const key = `${item.label}-${item.lat.toFixed(5)}-${item.lng.toFixed(5)}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
    const mergedSuggestions = mergeSuggestions(localMatches, suggestions);

    placeCache.set(cacheKey, { suggestions: mergedSuggestions, createdAt: Date.now() });

    return res.json({ ok: true, suggestions: mergedSuggestions });
  } catch (error) {
    if (localMatches.length) {
      return res.json({ ok: true, suggestions: localMatches, localOnly: true });
    }

    return res.status(502).json({
      ok: false,
      message: error.message || "Geoapify place search is unavailable.",
    });
  }
}

export { searchPlaces };
