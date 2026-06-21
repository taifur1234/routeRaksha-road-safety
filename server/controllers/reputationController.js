import User from "../models/User.js";
import { addAdminBonus, normalizeReputation, recalculateUserReputation } from "../services/reputationService.js";
import { cleanSearch, getPagination, isValidObjectId } from "../utils/validation.js";

async function getMyReputation(req, res) {
  const reputation = await recalculateUserReputation(req.user._id, { notify: false });
  return res.json({ ok: true, reputation });
}

async function getLeaderboard(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 10, maxLimit: 50 });
  const search = cleanSearch(req.query.search, 80);
  const sortBy = ["reputationPoints", "approvedReports", "reportsSubmitted"].includes(req.query.sortBy)
    ? req.query.sortBy
    : "reputationPoints";
  const direction = req.query.order === "asc" ? 1 : -1;
  const activeContributorFilter = {
    $or: [
      { reputationPoints: { $gt: 0 } },
      { reportsSubmitted: { $gt: 0 } },
      { approvedReports: { $gt: 0 } },
      { "badges.0": { $exists: true } },
    ],
  };
  const filter = { role: { $ne: "admin" }, ...activeContributorFilter };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$and = [
      activeContributorFilter,
      { $or: [{ name: regex }, { email: regex }, { trustLevel: regex }] },
    ];
    delete filter.$or;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email photoURL reputationPoints reportsSubmitted approvedReports rejectedReports trustLevel badges")
      .sort({ [sortBy]: direction, approvedReports: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res.json({
    ok: true,
    users: users.map(normalizeReputation),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function grantAdminBonus(req, res) {
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ ok: false, message: "Invalid user id." });
  }

  const reputation = await addAdminBonus({
    userId: req.params.userId,
    adminId: req.user._id,
    reason: req.body.reason,
  });

  return res.json({ ok: true, reputation });
}

export { getLeaderboard, getMyReputation, grantAdminBonus };
