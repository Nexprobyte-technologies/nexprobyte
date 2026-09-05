import mongoose from "mongoose";

const workReportSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    projectTitle: { type: String, required: true },
    hoursSpent: { type: Number, default: 8 },
    taskDetails: { type: String, required: true },
    blockers: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Under Review"],
      default: "Completed",
    },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

export const WorkReport = mongoose.models.WorkReport || mongoose.model("WorkReport", workReportSchema);
