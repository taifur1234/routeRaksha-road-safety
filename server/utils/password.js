import crypto from "crypto";

const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");
  const candidate = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export { hashPassword, verifyPassword };
