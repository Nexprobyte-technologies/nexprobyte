import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    dept: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, default: "Full-time" },
    salary: { type: String, required: true },
    palette: { type: String, default: "cobalt" },
    excerpt: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
