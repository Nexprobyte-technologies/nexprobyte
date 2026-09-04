import express from "express";
import { Application } from "../models/Application.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Submit Application (POST /api/applications - Public)
router.post("/", async (req, res) => {
  const {
    jobId,
    jobTitle,
    name,
    email,
    phone,
    experience,
    portfolioUrl,
    linkedinUrl,
    coverLetter,
    resumeFileName,
    resumeData,
    resumeSize,
  } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: "Full Name is required." });
  if (!email || !email.includes("@")) return res.status(400).json({ message: "Valid Email Address is required." });
  if (!phone || phone.trim().length < 8) return res.status(400).json({ message: "Valid Phone Number is required." });
  if (!jobTitle || !jobTitle.trim()) return res.status(400).json({ message: "Job Role selection is required." });

  const newApp = {
    _id: "app-" + Date.now(),
    jobId: jobId || "general",
    jobTitle: jobTitle.trim(),
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    experience: experience || "0-1 Year",
    portfolioUrl: portfolioUrl?.trim() || "",
    linkedinUrl: linkedinUrl?.trim() || "",
    coverLetter: coverLetter?.trim() || "",
    resumeFileName: resumeFileName || "resume.pdf",
    resumeData: resumeData || "",
    resumeSize: resumeSize || "",
    status: "New",
    createdAt: new Date().toISOString(),
  };

  if (getMongoConnected()) {
    try {
      const doc = await Application.create(newApp);
      return res.status(201).json({ message: "Application submitted successfully!", application: doc });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.applications.unshift(newApp);
  return res.status(201).json({ message: "Application submitted successfully!", application: newApp });
});

// Get Applications (GET /api/applications - Admin Protected)
router.get("/", verifyToken, async (req, res) => {
  if (getMongoConnected()) {
    try {
      const docs = await Application.find().sort({ createdAt: -1 });
      return res.json(docs);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.applications);
});

// Update Application Status (PUT /api/applications/:id - Admin Protected)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (getMongoConnected()) {
    try {
      const doc = await Application.findByIdAndUpdate(id, { status }, { new: true });
      return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  const appItem = memoryStore.applications.find((a) => a._id === id || a.id === id);
  if (appItem) {
    appItem.status = status;
    return res.json(appItem);
  }
  return res.status(404).json({ message: "Application not found." });
});

// Delete Application (DELETE /api/applications/:id - Admin Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (getMongoConnected()) {
    try {
      await Application.findByIdAndDelete(id);
      return res.json({ message: "Application deleted successfully." });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.applications = memoryStore.applications.filter((a) => a._id !== id && a.id !== id);
  return res.json({ message: "Application deleted successfully." });
});

export default router;
