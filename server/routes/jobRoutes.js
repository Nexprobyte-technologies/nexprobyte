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
      if (docs && docs.length > 0) return res.json(docs);
    } catch (e) {
      console.error("Fetch jobs error from Mongo:", e);
    }
  }
  return res.json(memoryStore.jobs);
});

// Get Single Job by Slug or ID (GET /api/jobs/:idOrSlug - Public)
router.get("/:idOrSlug", async (req, res) => {
  const { idOrSlug } = req.params;
  if (getMongoConnected()) {
    try {
      const doc = await Job.findOne({ $or: [{ slug: idOrSlug }, { _id: idOrSlug }] });
      if (doc) return res.json(doc);
    } catch (e) {
      console.error("Fetch single job error from Mongo:", e);
    }
  }
  const job = memoryStore.jobs.find((j) => j.slug === idOrSlug || j._id === idOrSlug || j.id === idOrSlug);
  if (job) return res.json(job);
  return res.status(404).json({ message: "Job not found." });
});

// Create Job (POST /api/jobs - Admin Protected)
router.post("/", verifyToken, async (req, res) => {
  const { title, dept, location, type, salary, excerpt, responsibilities, requirements, palette } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Job title is required." });
  }

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) slug = "job-" + Date.now();

  const newJob = {
    _id: "job-" + Date.now(),
    slug,
    title: title.trim(),
    dept: (dept || "Engineering").trim(),
    location: (location || "Coimbatore / Remote").trim(),
    type: type || "Full-time",
    salary: (salary || "Competitive").trim(),
    palette: palette || "cobalt",
    excerpt: (excerpt || title).trim(),
    responsibilities: Array.isArray(responsibilities)
      ? responsibilities
      : responsibilities
      ? responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    requirements: Array.isArray(requirements)
      ? requirements
      : requirements
      ? requirements.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    active: true,
    createdAt: new Date().toISOString(),
  };

  if (getMongoConnected()) {
    try {
      // Check if slug already exists in Mongo
      const existing = await Job.findOne({ slug: newJob.slug });
      if (existing) {
        newJob.slug = `${newJob.slug}-${Date.now().toString().slice(-4)}`;
      }
      const doc = await Job.create(newJob);
      return res.status(201).json(doc);
    } catch (e) {
      console.error("Job create error in MongoDB:", e);
      memoryStore.jobs.unshift(newJob);
      return res.status(201).json(newJob);
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
      let doc = null;
      if (id.startsWith("job-")) {
        doc = await Job.findOneAndUpdate({ $or: [{ _id: id }, { slug: id }] }, updates, { new: true });
      } else {
        doc = await Job.findByIdAndUpdate(id, updates, { new: true });
      }
      if (doc) return res.json(doc);
    } catch (e) {
      console.error("Job update error in Mongo:", e);
    }
  }

  const index = memoryStore.jobs.findIndex((j) => j._id === id || j.id === id || j.slug === id);
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
      if (id.startsWith("job-")) {
        await Job.findOneAndDelete({ $or: [{ _id: id }, { slug: id }] });
      } else {
        await Job.findByIdAndDelete(id);
      }
      return res.json({ message: "Job deleted." });
    } catch (e) {
      console.error("Job delete error in Mongo:", e);
    }
  }

  memoryStore.jobs = memoryStore.jobs.filter((j) => j._id !== id && j.id !== id && j.slug !== id);
  return res.json({ message: "Job deleted." });
});

export default router;
