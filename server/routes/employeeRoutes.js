import express from "express";
import { Employee } from "../models/Employee.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Helper to generate next Emp ID like NEX-104
function generateEmpId() {
  const existing = memoryStore.employees || [];
  const numbers = existing
    .map((e) => {
      const match = (e.empId || "").match(/NEX-(\d+)/);
      return match ? parseInt(match[1], 10) : 100;
    })
    .filter(Boolean);
  const nextNum = (numbers.length > 0 ? Math.max(...numbers) : 100) + 1;
  return `NEX-${nextNum}`;
}

// GET all employees (Super Admin) or current employee
router.get("/", verifyToken, async (req, res) => {
  try {
    if (getMongoConnected()) {
      const employees = await Employee.find().sort({ createdAt: -1 });
      return res.json(employees);
    }
    return res.json(memoryStore.employees || []);
  } catch (err) {
    console.error("Fetch employees error:", err);
    return res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// GET single employee by ID or empId
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (getMongoConnected()) {
      const employee = await Employee.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { empId: id }],
      });
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      return res.json(employee);
    }

    const employee = (memoryStore.employees || []).find(
      (e) => e._id === id || e.empId === id
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json(employee);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch employee" });
  }
});

// POST: Add new employee (Default status: Pending)
router.post("/", verifyToken, async (req, res) => {
  const { name, email, phone, department, designation, joiningDate, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const newEmpId = req.body.empId || generateEmpId();
  const initialStatus = status === "Confirmed" ? "Confirmed" : "Pending";
  const password = req.body.password || (initialStatus === "Confirmed" ? "Password@123" : "");

  const newEmp = {
    _id: `emp-${Date.now()}`,
    empId: newEmpId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || "",
    department: department || "Engineering",
    designation: designation || "Associate Engineer",
    joiningDate: joiningDate || new Date().toISOString().split("T")[0],
    status: initialStatus,
    password,
    role: "employee",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    leaveBalance: { casual: 12, sick: 8, paid: 10 },
    createdAt: new Date().toISOString(),
  };

  try {
    if (getMongoConnected()) {
      const created = await Employee.create(newEmp);
      return res.status(201).json(created);
    }

    if (!memoryStore.employees) memoryStore.employees = [];
    memoryStore.employees.unshift(newEmp);
    return res.status(201).json(newEmp);
  } catch (err) {
    console.error("Create employee error:", err);
    return res.status(500).json({ message: "Failed to create employee", error: err.message });
  }
});

// PUT: Update Employee Status & Credentials (Super Admin action)
// When status is "Confirmed", Super Admin sets email and password!
router.put("/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, email, password } = req.body;

  if (!status || !["Pending", "Confirmed"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'Pending' or 'Confirmed'" });
  }

  // If status is Confirmed, password should be provided or maintained
  if (status === "Confirmed" && !password) {
    return res.status(400).json({
      message: "Please specify a login password to confirm employee credentials.",
    });
  }

  try {
    if (getMongoConnected()) {
      const emp = await Employee.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { empId: id }],
      });
      if (!emp) return res.status(404).json({ message: "Employee not found" });

      emp.status = status;
      if (email) emp.email = email.trim().toLowerCase();
      if (password) emp.password = password;
      await emp.save();
      return res.json(emp);
    }

    const index = (memoryStore.employees || []).findIndex(
      (e) => e._id === id || e.empId === id
    );
    if (index === -1) return res.status(404).json({ message: "Employee not found" });

    const current = memoryStore.employees[index];
    current.status = status;
    if (email) current.email = email.trim().toLowerCase();
    if (password) current.password = password;
    if (status === "Pending" && req.body.clearPassword) current.password = "";

    memoryStore.employees[index] = current;
    return res.json(current);
  } catch (err) {
    console.error("Status update error:", err);
    return res.status(500).json({ message: "Failed to update employee status" });
  }
});

// PUT: Update Employee Details
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (getMongoConnected()) {
      const updated = await Employee.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { empId: id }] },
        updates,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Employee not found" });
      return res.json(updated);
    }

    const index = (memoryStore.employees || []).findIndex(
      (e) => e._id === id || e.empId === id
    );
    if (index === -1) return res.status(404).json({ message: "Employee not found" });

    memoryStore.employees[index] = { ...memoryStore.employees[index], ...updates };
    return res.json(memoryStore.employees[index]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update employee" });
  }
});

// DELETE: Remove Employee
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (getMongoConnected()) {
      await Employee.findOneAndDelete({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { empId: id }],
      });
      return res.json({ message: "Employee deleted successfully" });
    }

    memoryStore.employees = (memoryStore.employees || []).filter(
      (e) => e._id !== id && e.empId !== id
    );
    return res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete employee" });
  }
});

export default router;
