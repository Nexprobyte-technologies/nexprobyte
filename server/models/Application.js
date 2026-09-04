import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    experience: { type: String },
    portfolioUrl: { type: String },
    linkedinUrl: { type: String },
    coverLetter: { type: String },
    resumeFileName: { type: String },
    resumeData: { type: String },
    resumeSize: { type: String },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Shortlisted", "Rejected"],
      default: "New",
    },
  },
  { timestamps: true }
);

export const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);
