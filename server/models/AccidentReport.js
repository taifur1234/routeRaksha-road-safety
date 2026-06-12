import mongoose from "mongoose";

const accidentReportSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    type: {
      type: String,
      enum: ["Road accident", "Near miss", "Dangerous turn", "Pothole or bad road"],
      default: "Road accident",
    },
    severity: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "High",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    accidentTime: {
      type: String,
      default: "",
      trim: true,
    },
    lightCondition: {
      type: String,
      enum: ["Day", "Night", "Unknown"],
      default: "Unknown",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    imageData: {
      type: String,
      default: "",
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 60,
    },
    accidentFrequency: {
      type: Number,
      min: 0,
      default: 1,
    },
    routeRadiusMeters: {
      type: Number,
      min: 0,
      default: 650,
    },
    sourceId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },
    dataOrigin: {
      type: String,
      enum: ["user_report", "seed_blackspot", "imported_blackspot"],
      default: "user_report",
      index: true,
    },
    sourceType: {
      type: String,
      enum: [
        "Community report",
        "Community reports",
        "Government data",
        "Demo survey",
        "Khargone road safety cell",
        "RouteRaksha community",
      ],
      default: "Community report",
    },
    verificationStatus: {
      type: String,
      enum: ["government_verified", "community_verified", "under_review"],
      default: "under_review",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
      index: true,
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

accidentReportSchema.pre("validate", function validateCoordinates(next) {
  const hasLatitude = this.latitude !== null && this.latitude !== undefined;
  const hasLongitude = this.longitude !== null && this.longitude !== undefined;

  if (hasLatitude !== hasLongitude) {
    next(new Error("Latitude and longitude must be provided together."));
    return;
  }

  next();
});

accidentReportSchema.index({ status: 1, latitude: 1, longitude: 1 });
accidentReportSchema.index({ reporterEmail: 1, createdAt: -1 });

accidentReportSchema.index(
  { sourceId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceId: { $type: "string", $ne: "" } },
  },
);

const AccidentReport = mongoose.model("AccidentReport", accidentReportSchema);

export default AccidentReport;
