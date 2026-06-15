import mongoose from "mongoose";

const reputationEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["ADMIN_BONUS"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, strict: "throw" },
);

reputationEventSchema.index({ user: 1, createdAt: -1 });

const ReputationEvent = mongoose.model("ReputationEvent", reputationEventSchema);

export default ReputationEvent;
