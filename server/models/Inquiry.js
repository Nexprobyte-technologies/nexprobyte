import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    organization: { type: String, default: "" },
    service: { type: String, default: "General Inquiry" },
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "In Progress", "Completed"], default: "New" },
  },
  { timestamps: true }
);

export const Inquiry =
  mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
