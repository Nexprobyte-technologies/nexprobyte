import express from "express";
import { Inquiry } from "../models/Inquiry.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { Employee } from "../models/Employee.js";
import { Attendance } from "../models/Attendance.js";
import { Leave } from "../models/Leave.js";
import { WorkReport } from "../models/WorkReport.js";
import { Project } from "../models/Project.js";
import { getDbConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Stats Overview (GET /api/stats)
router.get("/", async (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];

  if (getDbConnected()) {
    try {
      const inquiriesCount = await Inquiry.countDocuments();
      const newInquiries = await Inquiry.countDocuments({ status: "New" });
      const applicationsCount = await Application.countDocuments();
      const activeJobs = await Job.countDocuments({ active: true });
      const totalEmployees = await Employee.countDocuments();
      const confirmedEmployees = await Employee.countDocuments({ status: "Confirmed" });
      const pendingEmployees = await Employee.countDocuments({ status: "Pending" });
      const todayPunches = await Attendance.countDocuments({ date: todayStr });
      const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
      const totalWorkReports = await WorkReport.countDocuments();
      const totalProjects = await Project.countDocuments();

      return res.json({
        totalInquiries: inquiriesCount,
        newInquiries,
        totalApplications: applicationsCount,
        activeJobs,
        totalEmployees,
        confirmedEmployees,
        pendingEmployees,
        todayPunches,
        pendingLeaves,
        totalWorkReports,
        totalProjects,
      });
    } catch (e) {
      console.error("Stats API error:", e);
    }
  }

  const todayPunches = (memoryStore.attendance || []).filter((a) => a.date === todayStr).length;
  const pendingLeaves = (memoryStore.leaves || []).filter((l) => l.status === "Pending").length;
  const confirmedEmployees = (memoryStore.employees || []).filter((e) => e.status === "Confirmed").length;
  const pendingEmployees = (memoryStore.employees || []).filter((e) => e.status === "Pending").length;

  return res.json({
    totalInquiries: memoryStore.inquiries.length,
    newInquiries: memoryStore.inquiries.filter((i) => i.status === "New").length,
    totalApplications: memoryStore.applications.length,
    activeJobs: memoryStore.jobs.filter((j) => j.active).length,
    totalEmployees: (memoryStore.employees || []).length,
    confirmedEmployees,
    pendingEmployees,
    todayPunches,
    pendingLeaves,
    totalWorkReports: (memoryStore.workReports || []).length,
    totalProjects: (memoryStore.projects || []).length,
  });
});

export default router;
