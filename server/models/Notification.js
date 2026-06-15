import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    type: {
      type: String,
      enum: [
        "REPORT_APPROVED",
        "REPORT_REJECTED",
        "NEW_BLACKSPOT_NEAR_ROUTE",
        "SAFETY_ALERT",
        "SYSTEM",
        "ACHIEVEMENT",
        "ADMIN",
      ],
      default: "SYSTEM",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, strict: "throw" },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
