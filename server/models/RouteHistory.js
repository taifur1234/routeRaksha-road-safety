import mongoose from "mongoose";

const routeEndpointSchema = new mongoose.Schema(
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

const routeHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: routeEndpointSchema,
      required: true,
    },
    destination: {
      type: routeEndpointSchema,
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
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

routeHistorySchema.index({ user: 1, searchedAt: -1 });

const RouteHistory = mongoose.model("RouteHistory", routeHistorySchema);

export default RouteHistory;
