import ContactMessage from "../models/ContactMessage.js";
import { cleanSearch, cleanText, getPagination, isValidEmail, isValidObjectId } from "../utils/validation.js";

const CONTACT_TOPICS = new Set([
  "Blackspot data correction",
  "Accident report help",
  "Product feedback",
  "Partnership request",
]);

function normalizeContactMessage(item) {
  return {
    id: item._id,
    firstName: item.firstName,
    lastName: item.lastName,
    name: `${item.firstName} ${item.lastName}`.trim(),
    email: item.email,
    topic: item.topic,
    message: item.message,
    userId: item.user,
    userEmail: item.userEmail,
    isSeen: Boolean(item.isSeen),
    seenAt: item.seenAt,
    seenBy: item.seenBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function createContactMessage(req, res) {
  const firstName = cleanText(req.body.firstName, 40);
  const lastName = cleanText(req.body.lastName, 40);
  const email = cleanText(req.body.email, 254).toLowerCase();
  const topic = cleanText(req.body.topic, 80);
  const message = cleanText(req.body.message, 1200);

  if (firstName.length < 2 || lastName.length < 2) {
    return res.status(400).json({ ok: false, message: "First and last name must be at least 2 characters." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
  }

  if (!CONTACT_TOPICS.has(topic)) {
    return res.status(400).json({ ok: false, message: "Please choose a valid contact topic." });
  }

  if (message.length < 20) {
    return res.status(400).json({ ok: false, message: "Message must be at least 20 characters." });
  }

  const contactMessage = await ContactMessage.create({
    firstName,
    lastName,
    email,
    topic,
    message,
    user: req.user?._id || null,
    userEmail: req.user?.email || "",
  });

  return res.status(201).json({
    ok: true,
    contactMessage: normalizeContactMessage(contactMessage),
    message: "Message submitted. Our team will review it shortly.",
  });
}

async function listContactMessages(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 12, maxLimit: 50 });
  const search = cleanSearch(req.query.search, 80);
  const filter = {};

  if (req.query.seen === "true") {
    filter.isSeen = true;
  }

  if (req.query.seen === "false") {
    filter.isSeen = false;
  }

  if (req.query.topic) {
    filter.topic = cleanText(req.query.topic, 80);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { topic: regex },
      { message: regex },
      { userEmail: regex },
    ];
  }

  const [items, total, unseenCount] = await Promise.all([
    ContactMessage.find(filter).sort({ isSeen: 1, createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
    ContactMessage.countDocuments({ isSeen: false }),
  ]);

  return res.json({
    ok: true,
    messages: items.map(normalizeContactMessage),
    unseenCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function markContactMessageSeen(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid message id." });
  }

  const contactMessage = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { $set: { isSeen: true, seenAt: new Date(), seenBy: req.user._id } },
    { new: true },
  );

  if (!contactMessage) {
    return res.status(404).json({ ok: false, message: "Contact message not found." });
  }

  return res.json({ ok: true, message: normalizeContactMessage(contactMessage) });
}

async function deleteContactMessage(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, message: "Invalid message id." });
  }

  const contactMessage = await ContactMessage.findByIdAndDelete(req.params.id);

  if (!contactMessage) {
    return res.status(404).json({ ok: false, message: "Contact message not found." });
  }

  return res.json({ ok: true, message: normalizeContactMessage(contactMessage) });
}

export { createContactMessage, deleteContactMessage, listContactMessages, markContactMessageSeen };
