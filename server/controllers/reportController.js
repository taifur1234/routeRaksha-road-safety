import AccidentReport from "../models/AccidentReport.js";
import {
  cleanText,
  isValidCoordinate,
  isValidImageData,
  isValidTime,
} from "../utils/validation.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { recalculateUserReputation } from "../services/reputationService.js";

const INCIDENT_TYPES = new Set(["Road accident", "Near miss", "Dangerous turn", "Pothole or bad road"]);
const SEVERITY_OPTIONS = new Set(["High", "Medium", "Low"]);
const LIGHT_OPTIONS = new Set(["Day", "Night", "Unknown"]);

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(a, b) {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalizeReport(report) {
  return {
    id: report._id,
    location: report.location,
    latitude: report.latitude,
    longitude: report.longitude,
    type: report.type,
    severity: report.severity,
    description: report.description,
    accidentTime: report.accidentTime,
    lightCondition: report.lightCondition,
    notes: report.notes,
    imageData: report.imageData,
    confidenceScore: report.confidenceScore,
    accidentFrequency: report.accidentFrequency,
    routeRadiusMeters: report.routeRadiusMeters,
    sourceId: report.sourceId,
    sourceUrl: report.sourceUrl,
    dataOrigin: report.dataOrigin,
    sourceType: report.sourceType,
    verificationStatus: report.verificationStatus,
    status: report.status,
    reporterName: report.reporterName,
    reporterEmail: report.reporterEmail,
    reviewedBy: report.reviewedBy,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    reviewedAt: report.reviewedAt,
    approvedAt: report.approvedAt,
    declinedAt: report.declinedAt,
  };
}

async function listReports(req, res) {
  const filter = req.user.role === "admin" ? {} : { reporterEmail: req.user.email };
  const reports = await AccidentReport.find(filter).sort({ createdAt: -1 });

  return res.json({ ok: true, reports: reports.map(normalizeReport) });
}

async function listApprovedReports(req, res) {
  const reports = await AccidentReport.find({ status: "approved" }).sort({ approvedAt: -1 });

  return res.json({ ok: true, reports: reports.map(normalizeReport) });
}

async function createReport(req, res) {
  const location = cleanText(req.body.location, 180);
  const description = cleanText(req.body.description, 1000);
  const notes = cleanText(req.body.notes, 500);
  const type = INCIDENT_TYPES.has(req.body.type) ? req.body.type : "";
  const severity = SEVERITY_OPTIONS.has(req.body.severity) ? req.body.severity : "";
  const accidentTime = cleanText(req.body.accidentTime, 5);
  const lightCondition = LIGHT_OPTIONS.has(req.body.lightCondition) ? req.body.lightCondition : "Unknown";
  const imageData = String(req.body.imageData || "");

  if (!location || !description) {
    return res.status(400).json({ ok: false, message: "Location and description are required." });
  }

  if (location.length < 5 || description.length < 20) {
    return res.status(400).json({
      ok: false,
      message: "Location must be at least 5 characters and description at least 20 characters.",
    });
  }

  if (!type || !severity) {
    return res.status(400).json({ ok: false, message: "Please choose a valid incident type and severity." });
  }

  if (!isValidTime(accidentTime)) {
    return res.status(400).json({ ok: false, message: "Please enter a valid accident time." });
  }

  if (!isValidImageData(imageData)) {
    return res.status(400).json({ ok: false, message: "Image must be JPG, PNG, or WebP and under 1 MB." });
  }

  const numericLatitude = Number(req.body.latitude);
  const numericLongitude = Number(req.body.longitude);
  const hasCoordinateInput =
    req.body.latitude !== null &&
    req.body.latitude !== undefined &&
    req.body.latitude !== "" &&
    req.body.longitude !== null &&
    req.body.longitude !== undefined &&
    req.body.longitude !== "";
  const hasCoordinates = hasCoordinateInput && isValidCoordinate(numericLatitude, numericLongitude);

  if (hasCoordinateInput && !hasCoordinates) {
    return res.status(400).json({ ok: false, message: "Accident coordinates are invalid." });
  }

  const recentReports = await AccidentReport.find({
    status: { $in: ["pending", "approved"] },
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });
  const duplicate = recentReports.find((report) => {
    const sameType = String(report.type || "").toLowerCase() === String(type || "").toLowerCase();
    const sameLocation =
      report.location.toLowerCase().includes(location.toLowerCase()) ||
      location.toLowerCase().includes(report.location.toLowerCase());

    if (hasCoordinates && Number.isFinite(report.latitude) && Number.isFinite(report.longitude)) {
      return (
        distanceInMeters(
          { lat: numericLatitude, lng: numericLongitude },
          { lat: report.latitude, lng: report.longitude },
        ) <= 180 && sameType
      );
    }

    return sameLocation && sameType;
  });

  if (duplicate) {
    return res.status(409).json({
      ok: false,
      message: "A similar report already exists near this area and is waiting for review.",
    });
  }

  const report = await AccidentReport.create({
    location,
    latitude: hasCoordinates ? numericLatitude : null,
    longitude: hasCoordinates ? numericLongitude : null,
    type,
    severity,
    description,
    accidentTime,
    lightCondition,
    notes,
    imageData,
    confidenceScore: imageData ? 72 : 64,
    accidentFrequency: 1,
    sourceType: "Community report",
    verificationStatus: "under_review",
    reporterName: req.user.name,
    reporterEmail: req.user.email,
  });
  recalculateUserReputation(req.user._id, { notify: false }).catch(() => {});

  return res.status(201).json({ ok: true, report: normalizeReport(report) });
}

async function updateReportStatus(req, res) {
  const { status } = req.body;

  if (!["approved", "declined", "pending"].includes(status)) {
    return res.status(400).json({ ok: false, message: "Invalid report status." });
  }

  const now = new Date();
  const report = await AccidentReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ ok: false, message: "Report not found." });
  }

  const previousStatus = report.status;
  report.status = status;
  report.reviewedBy = req.user.name || "Admin";
  report.reviewedAt = now;

  if (status === "approved") {
    report.approvedAt = now;
    report.verificationStatus = "community_verified";
    report.confidenceScore = Math.max(report.confidenceScore || 0, 78);
  }

  if (status === "declined") {
    report.declinedAt = now;
  }

  await report.save();

  if (previousStatus !== status) {
    const reporter = await User.findOne({ email: report.reporterEmail }).select("_id");

    if (reporter) {
      if (["approved", "declined"].includes(status)) {
        await createNotification({
          userId: reporter._id,
          title: status === "approved" ? "Report approved" : "Report rejected",
          message:
            status === "approved"
              ? "Your accident report has been approved."
              : "Your report was rejected after review.",
          type: status === "approved" ? "REPORT_APPROVED" : "REPORT_REJECTED",
          metadata: { reportId: report._id, location: report.location },
        });
      }

      await recalculateUserReputation(reporter._id);
    }
  }

  return res.json({ ok: true, report: normalizeReport(report) });
}

async function updateReport(req, res) {
  const allowed = [
    "location",
    "latitude",
    "longitude",
    "type",
    "severity",
    "description",
    "accidentTime",
    "lightCondition",
    "notes",
    "confidenceScore",
    "accidentFrequency",
    "routeRadiusMeters",
    "sourceId",
    "sourceUrl",
    "dataOrigin",
    "sourceType",
    "verificationStatus",
  ];
  const report = await AccidentReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ ok: false, message: "Report not found." });
  }

  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      report[field] = req.body[field];
    }
  });

  await report.save();

  return res.json({ ok: true, report: normalizeReport(report) });
}

async function deleteReport(req, res) {
  const report = await AccidentReport.findByIdAndDelete(req.params.id);

  if (!report) {
    return res.status(404).json({ ok: false, message: "Report not found." });
  }

  return res.json({ ok: true, report: normalizeReport(report) });
}

export { createReport, deleteReport, listApprovedReports, listReports, updateReport, updateReportStatus };
