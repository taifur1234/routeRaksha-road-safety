import crypto from "crypto";

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET || "route-raksha-dev-secret";
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
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

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = decodeBase64Url(encodedBody);

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export { signToken, verifyToken };
