const buckets = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  keyGenerator,
} = {}) {
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const bucketKey = `${req.baseUrl || req.path}:${key}`;
    const current = buckets.get(bucketKey);

    if (!current || current.resetAt <= now) {
      buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ ok: false, message });
    }

    return next();
  };
}

function userOrIpKey(req) {
  return req.user?.email || getClientIp(req);
}

export { createRateLimiter, getClientIp, userOrIpKey };
