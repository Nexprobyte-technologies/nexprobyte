import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Employee } from "../models/Employee.js";
import { verifyToken } from "../middleware/auth.js";
import { getDbConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nexprobyte_admin_secret_key_2026";

// Auth Login (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { username, email, password, loginType } = req.body;
  const loginIdentifier = (email || username || "").trim().toLowerCase();

  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: "Login identifier and password are required." });
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Super Admin Credentials Check
  // ─────────────────────────────────────────────────────────────
  if (
    (loginIdentifier === "nexadmin" || loginIdentifier === "admin@nexprobyte.com") &&
    password === "Nex@.1A"
  ) {
    const token = jwt.sign(
      { username: "NexAdmin", role: "admin", isSuperAdmin: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: {
        username: "NexAdmin",
        name: "Super Admin",
        email: "admin@nexprobyte.com",
        role: "admin",
        isSuperAdmin: true,
      },
    });
  }

  // Check PostgreSQL users table if connected (for admin roles)
  if (getDbConnected()) {
    try {
      const user = await User.findOne({
        $or: [{ username: new RegExp(`^${loginIdentifier}$`, "i") }, { email: loginIdentifier }],
      });
      if (user && user.password === password) {
        const token = jwt.sign(
          { id: user._id, username: user.username, role: user.role || "admin" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({
          token,
          user: {
            username: user.username,
            name: user.name,
            role: user.role || "admin",
            isSuperAdmin: user.role === "admin",
          },
        });
      }
    } catch (e) {
      console.error("Auth admin check error:", e);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Employee Login Check (from DB or memoryStore)
  // ─────────────────────────────────────────────────────────────
  let employee = null;

  if (getDbConnected()) {
    try {
      employee = await Employee.findOne({
        $or: [
          { email: loginIdentifier },
          { empId: new RegExp(`^${loginIdentifier}$`, "i") },
        ],
      });
    } catch (e) {
      console.error("Employee DB search error:", e);
    }
  }

  // Fallback to memoryStore
  if (!employee && memoryStore.employees) {
    employee = memoryStore.employees.find(
      (emp) =>
        emp.email.toLowerCase() === loginIdentifier ||
        (emp.empId && emp.empId.toLowerCase() === loginIdentifier)
    );
  }

  if (employee) {
    // Check Status: Must be "Confirmed"
    if (employee.status === "Pending") {
      return res.status(403).json({
        message:
          "Your employee status is currently PENDING. Login credentials must be confirmed and set by the Super Admin first.",
        status: "Pending",
      });
    }

    // Verify Password
    if (!employee.password || employee.password !== password) {
      return res.status(401).json({ message: "Invalid employee password." });
    }

    // Generate Employee Token
    const token = jwt.sign(
      {
        id: employee._id || employee.empId,
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        role: "employee",
        department: employee.department,
        designation: employee.designation,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: employee._id || employee.empId,
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        role: "employee",
        status: employee.status,
        avatar: employee.avatar,
        leaveBalance: employee.leaveBalance,
      },
    });
  }

  return res.status(401).json({ message: "Invalid username, email, or password." });
});

// Verify Auth Token (GET /api/auth/me)
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
