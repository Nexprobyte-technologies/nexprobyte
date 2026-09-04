import express from "express";
import { Inquiry } from "../models/Inquiry.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Stats Overview (GET /api/stats)
router.get("/", async (req, res) => {
  if (getMongoConnected()) {
    try {
      const inquiriesCount = await Inquiry.countDocuments();
      const newInquiries = await Inquiry.countDocuments({ status: "New" });
      const applicationsCount = await Application.countDocuments();
      const activeJobs = await Job.countDocuments({ active: true });
      return res.json({
        totalInquiries: inquiriesCount,
        newInquiries,
        totalApplications: applicationsCount,
        activeJobs,
      });
    } catch (e) {
      console.error("Stats API error:", e);
    }
  }

  return res.json({
    totalInquiries: memoryStore.inquiries.length,
    newInquiries: memoryStore.inquiries.filter((i) => i.status === "New").length,
    totalApplications: memoryStore.applications.length,
    activeJobs: memoryStore.jobs.filter((j) => j.active).length,
  });
});

export default router;
