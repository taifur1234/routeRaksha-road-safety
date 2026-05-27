import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB, getMongoStatus } from "./config/db.js";
import { ensureAdminUser } from "./controllers/authController.js";
import { seedInitialBlackspots } from "./controllers/blackspotSeedController.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many API requests. Please wait a few minutes and try again.",
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors());
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Frame-Options", "DENY");
  next();
});
app.use(express.json({ limit: "1.5mb" }));
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    server: "running",
    mongodb: getMongoStatus(),
  });
});

app.use("/api/chat", chatRoutes);

connectDB().then(async () => {
  await ensureAdminUser();
  const seedResult = await seedInitialBlackspots();
  console.log(
    `Blackspot seed synced: ${seedResult.upserted} inserted, ${seedResult.modified} updated`,
  );

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
