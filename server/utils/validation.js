const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const IMAGE_DATA_PATTERN = /^data:image\/(png|jpe?g|webp);base64,/i;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanSearch(value, maxLength = 80) {
  return cleanText(value, maxLength).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toFiniteNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim()) && String(value || "").length <= 254;
}

function isStrongPassword(value) {
  const password = String(value || "");
  return password.length >= 8 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function isValidCoordinate(lat, lng) {
  return (
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng)) &&
    Number(lat) >= -90 &&
    Number(lat) <= 90 &&
    Number(lng) >= -180 &&
    Number(lng) <= 180
  );
}

function isValidObjectId(value) {
  return OBJECT_ID_PATTERN.test(String(value || ""));
}

function getPagination(query = {}, defaults = {}) {
  const defaultLimit = defaults.limit || 10;
  const maxLimit = defaults.maxLimit || 50;
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function isValidTime(value) {
  return !value || TIME_PATTERN.test(String(value));
}

function isValidImageData(value, maxChars = 1_450_000) {
  return !value || (value.length <= maxChars && IMAGE_DATA_PATTERN.test(value));
}

export {
  cleanSearch,
  cleanText,
  getPagination,
  isStrongPassword,
  isValidCoordinate,
  isValidEmail,
  isValidImageData,
  isValidObjectId,
  isValidTime,
  toFiniteNumber,
};
