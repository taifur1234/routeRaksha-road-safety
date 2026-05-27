const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const IMAGE_DATA_PATTERN = /^data:image\/(png|jpe?g|webp);base64,/i;

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
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
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function isValidTime(value) {
  return !value || TIME_PATTERN.test(String(value));
}

function isValidImageData(value, maxChars = 1_450_000) {
  return !value || (value.length <= maxChars && IMAGE_DATA_PATTERN.test(value));
}

export {
  cleanText,
  isStrongPassword,
  isValidCoordinate,
  isValidEmail,
  isValidImageData,
  isValidTime,
};
