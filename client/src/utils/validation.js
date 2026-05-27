const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isValidEmail(value) {
  const email = cleanText(value);
  return EMAIL_PATTERN.test(email) && email.length <= 254;
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

function validateAuthForm({ isSignup, name, email, password }) {
  const cleanName = cleanText(name);

  if (isSignup && (cleanName.length < 2 || cleanName.length > 60)) {
    return "Name must be between 2 and 60 characters.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (isSignup && !isStrongPassword(password)) {
    return "Password must be 8-128 characters and include at least one letter and one number.";
  }

  if (!isSignup && !String(password || "").trim()) {
    return "Password is required.";
  }

  if (!isSignup && String(password || "").length > 128) {
    return "Invalid email or password.";
  }

  return "";
}

export { cleanText, isStrongPassword, isValidCoordinate, isValidEmail, validateAuthForm };
