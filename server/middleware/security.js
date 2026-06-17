const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

function parseAllowedOrigins() {
  const configured = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((safe, [key, item]) => {
      if (blockedKeys.has(key) || key.startsWith("$") || key.includes(".")) {
        return safe;
      }

      safe[key] = sanitizeValue(item);
      return safe;
    }, {});
  }

  if (typeof value === "string") {
    return value.replace(/\0/g, "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }

  return value;
}

function requestSanitizer(req, res, next) {
  req.body = sanitizeValue(req.body);
  const sanitizedQuery = sanitizeValue(req.query);
  const sanitizedParams = sanitizeValue(req.params);

  Object.keys(req.query || {}).forEach((key) => {
    delete req.query[key];
  });
  Object.assign(req.query, sanitizedQuery);

  Object.keys(req.params || {}).forEach((key) => {
    delete req.params[key];
  });
  Object.assign(req.params, sanitizedParams);
  next();
}

function securityHeaders(req, res, next) {
  res.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.set("Cross-Origin-Resource-Policy", "same-origin");
  res.set("Origin-Agent-Cluster", "?1");
  res.set("Referrer-Policy", "no-referrer");
  res.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-DNS-Prefetch-Control", "off");
  res.set("X-Download-Options", "noopen");
  res.set("X-Frame-Options", "DENY");
  res.set("X-Permitted-Cross-Domain-Policies", "none");
  res.set("X-XSS-Protection", "0");
  next();
}

function corsOptions() {
  const allowedOrigins = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

export { corsOptions, requestSanitizer, securityHeaders };
