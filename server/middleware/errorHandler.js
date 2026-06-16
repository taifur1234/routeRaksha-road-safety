function notFoundHandler(req, res) {
  return res.status(404).json({ ok: false, message: "API route not found." });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({ ok: false, message: "Validation failed.", errors: error.errors });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ ok: false, message: "Invalid identifier." });
  }

  if (error?.name === "MulterError" || String(error?.message || "").includes("Only JPG")) {
    return res.status(400).json({ ok: false, message: error.message || "Image upload failed." });
  }

  if (String(error?.message || "").includes("Latitude and longitude")) {
    return res.status(400).json({ ok: false, message: error.message });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ ok: false, message: "Duplicate record." });
  }

  const status = Number(error?.statusCode || error?.status || 500);
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  const message = error?.statusCode ? error.message : safeStatus >= 500 ? "Something went wrong. Please try again." : error.message;

  if (safeStatus >= 500) {
    console.error(error);
  }

  return res.status(safeStatus).json({ ok: false, message });
}

export { errorHandler, notFoundHandler };
