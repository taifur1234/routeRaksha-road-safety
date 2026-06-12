import crypto from "crypto";

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET || "route-raksha-dev-secret";
  const expiresInSeconds = Number(process.env.JWT_EXPIRES_SECONDS || 7 * 24 * 60 * 60);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const unsigned = `${base64Url(header)}.${base64Url(body)}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");

  return `${unsigned}.${signature}`;
}

function decodeBase64Url(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || "route-raksha-dev-secret";
  const [encodedHeader, encodedBody, signature] = String(token || "").split(".");

  if (!encodedHeader || !encodedBody || !signature) {
    return null;
  }

  const unsigned = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = decodeBase64Url(encodedBody);

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export { signToken, verifyToken };
