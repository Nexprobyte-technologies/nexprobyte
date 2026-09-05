import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true }, // links to empId or employee _id
    employeeName: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    clockIn: { type: String, default: "" }, // e.g. "09:15 AM"
    clockOut: { type: String, default: "" }, // e.g. "06:30 PM"
    totalHours: { type: String, default: "0h 0m" },
    status: {
      type: String,
      enum: ["Present", "Late", "Half-day", "Absent"],
      default: "Present",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
