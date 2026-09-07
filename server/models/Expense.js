import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    category: { type: String, default: "General" },
    to: { type: String, default: "" },
    reason: { type: String, default: "" },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["Office", "Salary"], default: "Office" },
    note: { type: String, default: "" },
    recordedByName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
