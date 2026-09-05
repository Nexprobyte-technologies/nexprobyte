import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: "" }, // Created when status is Confirmed
    phone: { type: String, default: "" },
    department: { type: String, default: "Engineering" },
    designation: { type: String, default: "Associate Engineer" },
    joiningDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    status: { type: String, enum: ["Pending", "Confirmed"], default: "Pending" },
    avatar: { type: String, default: "" },
    role: { type: String, default: "employee" },
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 8 },
      paid: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
