import express from "express";
import { Project } from "../models/Project.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Helper to generate next Project ID like PRJ-101
function generateProjectId() {
  const existing = memoryStore.projects || [];
  const numbers = existing
    .map((p) => {
      const match = (p.projectId || "").match(/PRJ-(\d+)/);
      return match ? parseInt(match[1], 10) : 100;
    })
    .filter(Boolean);
  const nextNum = (numbers.length > 0 ? Math.max(...numbers) : 100) + 1;
  return `PRJ-${nextNum}`;
}

// GET all projects
router.get("/", verifyToken, async (req, res) => {
  try {
    if (getMongoConnected()) {
      const projects = await Project.find().sort({ createdAt: -1 });
      return res.json(projects);
    }
    return res.json(memoryStore.projects || []);
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// GET single project
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (getMongoConnected()) {
      const project = await Project.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id }],
      });
      if (!project) return res.status(404).json({ message: "Project not found" });
      return res.json(project);
    }

    const project = (memoryStore.projects || []).find(
      (p) => p._id === id || p.projectId === id
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch project" });
  }
});

// POST: Create new project
router.post("/", verifyToken, async (req, res) => {
  const {
    title,
    clientName,
    clientEmail,
    category,
    description,
    assignedEmployees,
    startDate,
    deadline,
    budget,
    priority,
    status,
    progress,
    techStack,
    deliverablesUrl,
    notes,
  } = req.body;

  if (!title || !clientName) {
    return res.status(400).json({ message: "Project title and client name are required." });
  }

  const projectId = req.body.projectId || generateProjectId();
  const techStackArray = Array.isArray(techStack)
    ? techStack
    : typeof techStack === "string"
    ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const newProjectData = {
    projectId,
    title,
    clientName,
    clientEmail: clientEmail || "",
    category: category || "Web Development",
    description: description || "",
    assignedEmployees: assignedEmployees || [],
    startDate: startDate || new Date().toISOString().split("T")[0],
    deadline: deadline || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
    budget: budget || "",
    priority: priority || "Medium",
    status: status || "In Progress",
    progress: typeof progress === "number" ? progress : 0,
    techStack: techStackArray,
    deliverablesUrl: deliverablesUrl || "",
    notes: notes || "",
  };

  try {
    if (getMongoConnected()) {
      const created = await Project.create(newProjectData);
      return res.status(201).json(created);
    }

    const createdMemory = {
      _id: `prj-${Date.now()}`,
      ...newProjectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!memoryStore.projects) {
      memoryStore.projects = [];
    }
    memoryStore.projects.unshift(createdMemory);
    return res.status(201).json(createdMemory);
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ message: "Failed to create project", error: err.message });
  }
});

// PUT: Update project
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.techStack && typeof updates.techStack === "string") {
    updates.techStack = updates.techStack.split(",").map((s) => s.trim()).filter(Boolean);
  }

  try {
    if (getMongoConnected()) {
      const updated = await Project.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id }] },
        { $set: updates },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Project not found" });
      return res.json(updated);
    }

    const index = (memoryStore.projects || []).findIndex(
      (p) => p._id === id || p.projectId === id
    );
    if (index === -1) return res.status(404).json({ message: "Project not found" });

    memoryStore.projects[index] = {
      ...memoryStore.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.json(memoryStore.projects[index]);
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ message: "Failed to update project" });
  }
});

// PATCH: Quick status & progress update
router.patch("/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, progress } = req.body;

  try {
    const updateObj = {};
    if (status !== undefined) updateObj.status = status;
    if (progress !== undefined) updateObj.progress = progress;

    if (getMongoConnected()) {
      const updated = await Project.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id }] },
        { $set: updateObj },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Project not found" });
      return res.json(updated);
    }

    const index = (memoryStore.projects || []).findIndex(
      (p) => p._id === id || p.projectId === id
    );
    if (index === -1) return res.status(404).json({ message: "Project not found" });

    if (status !== undefined) memoryStore.projects[index].status = status;
    if (progress !== undefined) memoryStore.projects[index].progress = progress;
    memoryStore.projects[index].updatedAt = new Date().toISOString();

    return res.json(memoryStore.projects[index]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update status" });
  }
});

// DELETE: Delete project
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (getMongoConnected()) {
      const deleted = await Project.findOneAndDelete({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id }],
      });
      if (!deleted) return res.status(404).json({ message: "Project not found" });
      return res.json({ message: "Project deleted successfully" });
    }

    const initialLen = (memoryStore.projects || []).length;
    memoryStore.projects = (memoryStore.projects || []).filter(
      (p) => p._id !== id && p.projectId !== id
    );

    if (memoryStore.projects.length === initialLen) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ message: "Project deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;
