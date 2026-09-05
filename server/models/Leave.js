import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Unpaid Leave"],
      default: "Casual Leave",
    },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    days: { type: Number, default: 1 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminRemark: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Leave = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);
