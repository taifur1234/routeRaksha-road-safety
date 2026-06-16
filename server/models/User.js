import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: "",
    },
    firebaseUid: {
      type: String,
      default: "",
      index: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    photoPublicId: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    reputationPoints: {
      type: Number,
      min: 0,
      default: 0,
      index: true,
    },
    reportsSubmitted: {
      type: Number,
      min: 0,
      default: 0,
    },
    approvedReports: {
      type: Number,
      min: 0,
      default: 0,
    },
    rejectedReports: {
      type: Number,
      min: 0,
      default: 0,
    },
    trustLevel: {
      type: String,
      enum: ["New User", "Contributor", "Trusted Reporter", "Expert Reporter"],
      default: "New User",
      index: true,
    },
    badges: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
          earnedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.index({ reputationPoints: -1, approvedReports: -1 });

const User = mongoose.model("User", userSchema);

export default User;
