import express from "express";
import { WorkReport } from "../models/WorkReport.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// GET Work Reports
router.get("/", verifyToken, async (req, res) => {
  const { empId } = req.query;
  const isEmployee = req.user.role === "employee";
  const targetEmpId = isEmployee ? (req.user.empId || req.user.id) : empId;

  try {
    if (getMongoConnected()) {
      const query = targetEmpId ? { employeeId: targetEmpId } : {};
      const reports = await WorkReport.find(query).sort({ date: -1, createdAt: -1 });
      return res.json(reports);
    }

    let reports = memoryStore.workReports || [];
    if (targetEmpId) {
      reports = reports.filter((r) => r.employeeId === targetEmpId);
    }
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch work reports" });
  }
});

// POST Daily Work Status (Employee action)
router.post("/", verifyToken, async (req, res) => {
  const { projectTitle, taskDetails, hoursSpent, blockers, status, link, date } = req.body;
  const employeeId = req.user.empId || req.user.id || req.body.employeeId;
  const employeeName = req.user.name || req.body.employeeName || "Employee";

  if (!projectTitle || !taskDetails) {
    return res.status(400).json({ message: "Project title and task details are required" });
  }

  const newReport = {
    _id: `wr-${Date.now()}`,
    employeeId,
    employeeName,
    date: date || new Date().toISOString().split("T")[0],
    projectTitle: projectTitle.trim(),
    hoursSpent: parseFloat(hoursSpent) || 8,
    taskDetails: taskDetails.trim(),
    blockers: blockers ? blockers.trim() : "None",
    status: status || "Completed",
    link: link ? link.trim() : "",
    createdAt: new Date().toISOString(),
  };

  try {
    if (getMongoConnected()) {
      const created = await WorkReport.create(newReport);
      return res.status(201).json(created);
    }

    if (!memoryStore.workReports) memoryStore.workReports = [];
    memoryStore.workReports.unshift(newReport);
    return res.status(201).json(newReport);
  } catch (err) {
    console.error("Create work report error:", err);
    return res.status(500).json({ message: "Failed to submit work report" });
  }
});

export default router;
