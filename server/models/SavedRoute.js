import mongoose from "mongoose";

const routePointSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 260,
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false },
);

const savedRouteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    routeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    source: {
      type: routePointSchema,
      required: true,
    },
    destination: {
      type: routePointSchema,
      required: true,
    },
    safetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    routeType: {
      type: String,
      enum: ["fastest", "safest", "balanced"],
      required: true,
      index: true,
    },
    distanceMeters: {
      type: Number,
      min: 0,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    blackSpotCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

savedRouteSchema.index({ user: 1, createdAt: -1 });
savedRouteSchema.index({ user: 1, routeName: 1 });

const SavedRoute = mongoose.model("SavedRoute", savedRouteSchema);

export default SavedRoute;
