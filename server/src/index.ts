import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import http from "http";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { connectDatabase } from "./config/db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import adminRoutes from "./routes/admin";
import adsRoutes from "./routes/ads";
import aiRoutes from "./routes/ai";
import authRoutes from "./routes/auth";
import bookingRoutes from "./routes/bookings";
import eventsRoutes from "./routes/events";
import notificationRoutes from "./routes/notifications";
import paymentRoutes from "./routes/payments";
import supportRoutes from "./routes/support";
import uploadRoutes from "./routes/uploads";
import { seedDatabase } from "./utils/seed";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = Array.from(
  new Set([process.env.CLIENT_URL, ...defaultOrigins].filter(Boolean) as string[])
);

const start = async () => {
  await connectDatabase();
  await seedDatabase();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  app.set("socketio", io);

  io.on("connection", (socket) => {
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression());
  app.set("trust proxy", 1);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use("/api/payments/webhooks/razorpay", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

  app.get("/", (_req, res) => {
    res.send("EventSphere TypeScript API running");
  });

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/ads", adsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/payments", paymentRoutes);

  if (process.env.NODE_ENV === "production") {
    const frontendDist = path.resolve(__dirname, "../../../dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
        return;
      }
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
