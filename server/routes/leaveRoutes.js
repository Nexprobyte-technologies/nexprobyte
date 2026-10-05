import express from "express";
import { Leave } from "../models/Leave.js";
import { verifyToken } from "../middleware/auth.js";
import { getDbConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// GET Leaves
router.get("/", verifyToken, async (req, res) => {
  const { empId } = req.query;
  const isEmployee = req.user.role === "employee";
  const targetEmpId = isEmployee ? (req.user.empId || req.user.id) : empId;

  try {
    if (getDbConnected()) {
      const query = targetEmpId ? { employeeId: targetEmpId } : {};
      const leaves = await Leave.find(query).sort({ createdAt: -1 });
      return res.json(leaves);
    }

    let leaves = memoryStore.leaves || [];
    if (targetEmpId) {
      leaves = leaves.filter((l) => l.employeeId === targetEmpId);
    }
    return res.json(leaves);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch leaves" });
  }
});

// POST Apply Leave (Employee action)
router.post("/", verifyToken, async (req, res) => {
  const { leaveType, fromDate, toDate, days, reason } = req.body;
  const employeeId = req.user.empId || req.user.id || req.body.employeeId;
  const employeeName = req.user.name || req.body.employeeName || "Employee";

  if (!fromDate || !toDate || !reason) {
    return res.status(400).json({ message: "Dates and reason are required" });
  }

  const newLeave = {
    // _id: `lv-${Date.now()}`,
    employeeId,
    employeeName,
    leaveType: leaveType || "Casual Leave",
    fromDate,
    toDate,
    days: Number(days) || 1,
    reason: reason.trim(),
    status: "Pending",
    adminRemark: "",
    createdAt: new Date().toISOString(),
  };

  try {
    if (getDbConnected()) {
      const created = await Leave.create(newLeave);
      return res.status(201).json(created);
    }

    if (!memoryStore.leaves) memoryStore.leaves = [];
    memoryStore.leaves.unshift(newLeave);
    return res.status(201).json(newLeave);
  } catch (err) {
    console.error("Apply leave error:", err);
    return res.status(500).json({ message: "Failed to apply for leave" });
  }
});

// PUT Update Leave Status (Super Admin action)
router.put("/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, adminRemark } = req.body;

  if (!status || !["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be Pending, Approved, or Rejected" });
  }

  try {
    if (getDbConnected()) {
      const leave = await Leave.findById(id);
      if (!leave) return res.status(404).json({ message: "Leave request not found" });
      leave.status = status;
      if (adminRemark !== undefined) leave.adminRemark = adminRemark;
      await leave.save();
      return res.json(leave);
    }

    const leave = (memoryStore.leaves || []).find((l) => l._id === id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    leave.status = status;
    if (adminRemark !== undefined) leave.adminRemark = adminRemark;
    return res.json(leave);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update leave status" });
  }
});

export default router;
