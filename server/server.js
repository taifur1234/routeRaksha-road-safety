import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { connectDB, getMongoStatus } from "./config/db.js";
import { ensureAdminUser } from "./controllers/authController.js";
import { seedInitialBlackspots } from "./controllers/blackspotSeedController.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { corsOptions, requestSanitizer, securityHeaders } from "./middleware/security.js";
import { initializeSocketServer } from "./services/socketService.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reputationRoutes from "./routes/reputationRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many API requests. Please wait a few minutes and try again.",
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "1.5mb" }));
app.use(requestSanitizer);
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/emergency-services", emergencyRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/notifications", notificationRoutes);
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
app.use("/api", notFoundHandler);
app.use(errorHandler);

connectDB().then(async () => {
  await initializeSocketServer(httpServer);
  await ensureAdminUser();
  const seedResult = await seedInitialBlackspots();
  console.log(
    `Blackspot seed synced: ${seedResult.upserted} inserted, ${seedResult.modified} updated`,
  );

  httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
