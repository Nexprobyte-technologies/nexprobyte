import express from "express";
import { Expense } from "../models/Expense.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Create Expense (POST /api/expenses - Admin Protected)
router.post("/", verifyToken, async (req, res) => {
  const {
    date,
    category,
    to,
    reason,
    amount,
    type,
    note,
    recordedByName,
  } = req.body;

  if (!date) return res.status(400).json({ message: "Date is required." });
  const amt = Number(amount);
  if (!amt || isNaN(amt) || amt <= 0)
    return res.status(400).json({ message: "A valid amount is required." });
  if (!reason || !reason.trim())
    return res.status(400).json({ message: "Reason / purpose is required." });

  const newExpense = {
    _id: "exp-" + Date.now(),
    date: date,
    category: category || "General",
    to: to?.trim() || "",
    reason: reason.trim(),
    amount: amt,
    type: type === "Salary" ? "Salary" : "Office",
    note: note?.trim() || "",
    recordedByName: recordedByName?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  if (getMongoConnected()) {
    try {
      const doc = await Expense.create(newExpense);
      return res.status(201).json({ message: "Expense recorded.", entry: doc });
    } catch (e) {
      console.error(e);
    }
  }
  memoryStore.expenses.unshift(newExpense);
  return res.status(201).json({ message: "Expense recorded.", entry: newExpense });
});

// Get All Expenses (GET /api/expenses - Admin Protected)
router.get("/", verifyToken, async (req, res) => {
  if (getMongoConnected()) {
    try {
      const docs = await Expense.find().sort({ createdAt: -1 });
      return res.json(docs);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.expenses);
});

// Update Expense (PUT /api/expenses/:id - Admin Protected)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const allowed = ["date", "category", "to", "reason", "amount", "type", "note", "recordedByName"];
  const clean = {};
  for (const key of allowed) {
    if (patch[key] !== undefined) clean[key] = key === "amount" ? Number(patch[key]) : patch[key];
  }

  if (getMongoConnected()) {
    try {
      const doc = await Expense.findByIdAndUpdate(id, clean, { new: true });
      if (doc) return res.json(doc);
      return res.status(404).json({ message: "Expense not found." });
    } catch (e) {
      console.error(e);
    }
  }

  const item = memoryStore.expenses.find((x) => x._id === id || x.id === id);
  if (item) {
    Object.assign(item, clean, { _id: item._id });
    return res.json(item);
  }
  return res.status(404).json({ message: "Expense not found." });
});

// Delete Expense (DELETE /api/expenses/:id - Admin Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (getMongoConnected()) {
    try {
      await Expense.findByIdAndDelete(id);
      return res.json({ message: "Expense deleted." });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.expenses = memoryStore.expenses.filter((x) => x._id !== id && x.id !== id);
  return res.json({ message: "Expense deleted." });
});

export default router;
