import dotenv from "dotenv";
dotenv.config(); // ← MUST be first before any route imports read process.env

import express from "express";
import cors from "cors";
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

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

