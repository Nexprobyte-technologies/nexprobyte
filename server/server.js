import dotenv from "dotenv";
dotenv.config(); // ← MUST be first before any route imports read process.env

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import compression from "compression";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { setMongoConnected } from "./store/memoryStore.js";

import authRoutes from "./routes/authRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import workReportRoutes from "./routes/workReportRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// Mount Modular API Routers
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/work-reports", workReportRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/projects", projectRoutes);

// Root health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Nexprobyte API backend server is operational." });
});

// ---- Production static hosting (serves the built ./dist bundle) ----
const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(path.join(distDir, "index.html"))) {
  // Hashed build assets (JS/CSS/OGL) are immutable → cache for 1 year
  app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
      maxAge: "365d",
      immutable: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
  // Images / robots / sitemap — refreshed occasionally, cache 1 day
  app.use(
    express.static(distDir, {
      maxAge: "1d",
      setHeaders(res, filePath) {
        if (/\.(png|jpe?g|webp|avif|svg|ico|json|xml|txt)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    })
  );
  // SPA fallback — any non-API GET returns index.html
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(distDir, "index.html"));
  });
  console.log("\n📦 [Static]: serving ./dist with gzip + caching");
}

// Start Server
app.listen(PORT, async () => {
  console.log(`\n🚀 [Nexprobyte Backend Server Running]: http://localhost:${PORT}`);
  const isMongoConnected = await connectDB();
  setMongoConnected(isMongoConnected);
  
  if (isMongoConnected) {
    // Seed admin if MongoDB connected
    try {
      const existingAdmin = await User.findOne({ username: "NexAdmin" });
      if (!existingAdmin) {
        await User.create({
          username: "NexAdmin",
          password: "Nex@.1A",
          name: "Nexpro Admin",
          role: "admin"
        });
        console.log("✅ [MongoDB Seeded]: Default Admin User Created (NexAdmin / Nex@.1A)");
      }
    } catch (e) {
      console.error("Seed error:", e);
    }
  }
});

// Keep Node event loop active indefinitely
setInterval(() => {}, 3600000);

