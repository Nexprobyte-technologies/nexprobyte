import express from "express";
import { Attendance } from "../models/Attendance.js";
import { verifyToken } from "../middleware/auth.js";
import { getDbConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// GET Attendance Records
router.get("/", verifyToken, async (req, res) => {
  const { empId } = req.query;
  const isEmployee = req.user.role === "employee";
  const targetEmpId = isEmployee ? (req.user.empId || req.user.id) : empId;

  try {
    if (getDbConnected()) {
      const query = targetEmpId ? { employeeId: targetEmpId } : {};
      const records = await Attendance.find(query).sort({ date: -1, createdAt: -1 });
      return res.json(records);
    }

    let records = memoryStore.attendance || [];
    if (targetEmpId) {
      records = records.filter((r) => r.employeeId === targetEmpId);
    }
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

// POST Clock-In
router.post("/clockin", verifyToken, async (req, res) => {
  const employeeId = (req.body && req.body.employeeId) || req.user.empId || req.user.id;
  const employeeName = (req.body && req.body.employeeName) || req.user.name || "Employee";
  const today = new Date().toISOString().split("T")[0];
  const nowTime = formatTime(new Date());

  // Determine status (Present or Late if after 9:30 AM)
  const currentHour = new Date().getHours();
  const currentMin = new Date().getMinutes();
  const isLate = currentHour > 9 || (currentHour === 9 && currentMin > 30);
  const status = isLate ? "Late" : "Present";

  try {
    if (getDbConnected()) {
      let existing = await Attendance.findOne({ employeeId, date: today });
      if (existing && !existing.clockOut) {
        return res.status(400).json({ message: "Already clocked in! Please punch out first." });
      }
      if (existing && existing.clockOut) {
        existing.clockIn = nowTime;
        existing.clockOut = "";
        existing.totalHours = "Working...";
        existing.status = status;
        await existing.save();
        return res.json(existing);
      }
      const record = await Attendance.create({
        employeeId,
        employeeName,
        date: today,
        clockIn: nowTime,
        status,
        notes: req.body.notes || (isLate ? "Clocked in after 9:30 AM" : "Standard on-time clock in"),
      });
      return res.status(201).json(record);
    }

    if (!memoryStore.attendance) memoryStore.attendance = [];
    const existingIndex = memoryStore.attendance.findIndex((r) => r.employeeId === employeeId && r.date === today);
    if (existingIndex !== -1) {
      const rec = memoryStore.attendance[existingIndex];
      if (!rec.clockOut) {
        return res.status(400).json({ message: "Already clocked in! Please punch out first." });
      }
      // Re-punch in
      rec.clockIn = nowTime;
      rec.clockOut = "";
      rec.totalHours = "Working...";
      rec.status = status;
      memoryStore.attendance[existingIndex] = rec;
      return res.json(rec);
    }

    const newRecord = {
      _id: `att-${Date.now()}`,
      employeeId,
      employeeName,
      date: today,
      clockIn: nowTime,
      clockOut: "",
      totalHours: "Working...",
      status,
      notes: req.body.notes || (isLate ? "Clocked in after 9:30 AM" : "Standard on-time clock in"),
      createdAt: new Date().toISOString(),
    };
    memoryStore.attendance.unshift(newRecord);
    return res.status(201).json(newRecord);
  } catch (err) {
    console.error("Clockin error:", err);
    return res.status(500).json({ message: "Failed to clock in" });
  }
});

// POST Clock-Out
router.post("/clockout", verifyToken, async (req, res) => {
  const employeeId = (req.body && req.body.employeeId) || req.user.empId || req.user.id;
  const today = new Date().toISOString().split("T")[0];
  const nowTime = formatTime(new Date());

  try {
    if (getDbConnected()) {
      const record = await Attendance.findOne({ employeeId, date: today });
      if (!record || !record.clockIn) {
        return res.status(404).json({ message: "No active punch-in found for today. Punch in first." });
      }
      record.clockOut = nowTime;
      record.totalHours = "8h 15m";
      await record.save();
      return res.json(record);
    }

    const record = (memoryStore.attendance || []).find(
      (r) => r.employeeId === employeeId && r.date === today
    );
    if (!record || !record.clockIn) {
      return res.status(404).json({ message: "No active punch-in found for today. Punch in first." });
    }

    record.clockOut = nowTime;
    record.totalHours = "8h 15m";
    return res.json(record);
  } catch (err) {
    return res.status(500).json({ message: "Failed to clock out" });
  }
});

export default router;
