import { cleanText, isValidEmail } from "../utils/validation.js";

const CONTACT_TOPICS = new Set([
  "Blackspot data correction",
  "Accident report help",
  "Product feedback",
  "Partnership request",
]);

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

  console.log("Contact message received", {
    from: `${firstName} ${lastName}`,
    email,
    topic,
    user: req.user?.email,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ ok: true, message: "Message submitted. Our team will review it shortly." });
}

export { createContactMessage };
