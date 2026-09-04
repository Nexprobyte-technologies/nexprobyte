import express from "express";
import { Job } from "../models/Job.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Get Jobs (GET /api/jobs - Public)
router.get("/", async (req, res) => {
  if (getMongoConnected()) {
    try {
      const docs = await Job.find().sort({ createdAt: -1 });
      return res.json(docs);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.jobs);
});

// Create Job (POST /api/jobs - Admin Protected)
router.post("/", verifyToken, async (req, res) => {
  const { title, dept, location, type, salary, excerpt, responsibilities, requirements } = req.body;

  if (!title || !dept || !location || !salary || !excerpt) {
    return res.status(400).json({ message: "Title, department, location, salary and excerpt are required." });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newJob = {
    _id: "job-" + Date.now(),
    slug,
    title,
    dept,
    location,
    type: type || "Full-time",
    salary,
    palette: "cobalt",
    excerpt,
    responsibilities: Array.isArray(responsibilities)
      ? responsibilities
      : responsibilities
      ? responsibilities.split("\n").filter(Boolean)
      : [],
    requirements: Array.isArray(requirements)
      ? requirements
      : requirements
      ? requirements.split("\n").filter(Boolean)
      : [],
    active: true,
    createdAt: new Date().toISOString(),
  };

  if (getMongoConnected()) {
    try {
      const doc = await Job.create(newJob);
      return res.status(201).json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.jobs.unshift(newJob);
  return res.status(201).json(newJob);
});

// Update Job (PUT /api/jobs/:id - Admin Protected)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (getMongoConnected()) {
    try {
      const doc = await Job.findByIdAndUpdate(id, updates, { new: true });
      return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  const index = memoryStore.jobs.findIndex((j) => j._id === id || j.id === id);
  if (index !== -1) {
    memoryStore.jobs[index] = { ...memoryStore.jobs[index], ...updates };
    return res.json(memoryStore.jobs[index]);
  }
  return res.status(404).json({ message: "Job not found." });
});

// Delete Job (DELETE /api/jobs/:id - Admin Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (getMongoConnected()) {
    try {
      await Job.findByIdAndDelete(id);
      return res.json({ message: "Job deleted." });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.jobs = memoryStore.jobs.filter((j) => j._id !== id && j.id !== id);
  return res.json({ message: "Job deleted." });
});

export default router;
