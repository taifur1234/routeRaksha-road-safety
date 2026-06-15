import AccidentReport from "../models/AccidentReport.js";
import ReputationEvent from "../models/ReputationEvent.js";
import User from "../models/User.js";
import { cleanText } from "../utils/validation.js";
import { createNotification } from "./notificationService.js";

const TRUST_LEVELS = [
  { label: "Expert Reporter", min: 500 },
  { label: "Trusted Reporter", min: 200 },
  { label: "Contributor", min: 50 },
  { label: "New User", min: 0 },
];

const BADGES = [
  { key: "first-approved-report", label: "First Approved Report", approvedReports: 1 },
  { key: "10-approved-reports", label: "10 Approved Reports", approvedReports: 10 },
  { key: "50-approved-reports", label: "50 Approved Reports", approvedReports: 50 },
  { key: "100-approved-reports", label: "100 Approved Reports", approvedReports: 100 },
];

function getTrustLevel(points) {
  return TRUST_LEVELS.find((level) => points >= level.min)?.label || "New User";
}

function getBadgeSet(approvedReports, existingBadges = []) {
  const existing = new Map(existingBadges.map((badge) => [badge.key, badge]));
  const now = new Date();

  return BADGES.filter((badge) => approvedReports >= badge.approvedReports).map((badge) => ({
    key: badge.key,
    label: badge.label,
    earnedAt: existing.get(badge.key)?.earnedAt || now,
  }));
}

function normalizeReputation(user) {
  const approvalRate = user.reportsSubmitted
    ? Math.round((user.approvedReports / user.reportsSubmitted) * 100)
    : 0;

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || "",
    reputationPoints: user.reputationPoints || 0,
    reportsSubmitted: user.reportsSubmitted || 0,
    approvedReports: user.approvedReports || 0,
    rejectedReports: user.rejectedReports || 0,
    trustLevel: user.trustLevel || "New User",
    badges: user.badges || [],
    approvalRate,
  };
}

async function recalculateUserReputation(userIdOrEmail, { notify = true } = {}) {
  const user =
    typeof userIdOrEmail === "string" && userIdOrEmail.includes("@")
      ? await User.findOne({ email: userIdOrEmail.toLowerCase() })
      : await User.findById(userIdOrEmail);

  if (!user) {
    return null;
  }

  const previousTrustLevel = user.trustLevel || "New User";
  const previousBadgeKeys = new Set((user.badges || []).map((badge) => badge.key));
  const [reportsSubmitted, approvedReports, rejectedReports, bonusEvents] = await Promise.all([
    AccidentReport.countDocuments({ reporterEmail: user.email }),
    AccidentReport.countDocuments({ reporterEmail: user.email, status: "approved" }),
    AccidentReport.countDocuments({ reporterEmail: user.email, status: "declined" }),
    ReputationEvent.find({ user: user._id }),
  ]);
  const bonusPoints = bonusEvents.reduce((sum, event) => sum + Number(event.points || 0), 0);
  const reputationPoints = Math.max(0, approvedReports * 10 - rejectedReports * 2 + bonusPoints);
  const badges = getBadgeSet(approvedReports, user.badges);
  const trustLevel = getTrustLevel(reputationPoints);

  user.reputationPoints = reputationPoints;
  user.reportsSubmitted = reportsSubmitted;
  user.approvedReports = approvedReports;
  user.rejectedReports = rejectedReports;
  user.trustLevel = trustLevel;
  user.badges = badges;
  await user.save();

  if (notify) {
    const newBadges = badges.filter((badge) => !previousBadgeKeys.has(badge.key));

    await Promise.all([
      ...newBadges.map((badge) =>
        createNotification({
          userId: user._id,
          title: "New badge earned",
          message: `You earned ${badge.label}.`,
          type: "ACHIEVEMENT",
          metadata: { badgeKey: badge.key },
        }),
      ),
      previousTrustLevel !== trustLevel
        ? createNotification({
            userId: user._id,
            title: "Trust level increased",
            message: `You are now a ${trustLevel}.`,
            type: "ACHIEVEMENT",
            metadata: { trustLevel },
          })
        : Promise.resolve(null),
    ]);
  }

  return normalizeReputation(user);
}

async function addAdminBonus({ userId, adminId, reason }) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  await ReputationEvent.create({
    user: user._id,
    type: "ADMIN_BONUS",
    points: 20,
    reason: cleanText(reason, 240) || "Admin manual bonus",
    createdBy: adminId,
  });

  await createNotification({
    userId: user._id,
    title: "Reputation bonus awarded",
    message: "An admin awarded you 20 reputation points.",
    type: "ADMIN",
  });

  return recalculateUserReputation(user._id);
}

export { addAdminBonus, getTrustLevel, normalizeReputation, recalculateUserReputation };
