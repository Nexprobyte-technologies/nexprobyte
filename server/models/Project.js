import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile App",
        "AI / ML",
        "Cloud & DevOps",
        "UI/UX Design",
        "Custom Software",
        "Consulting",
      ],
      default: "Web Development",
    },
    description: { type: String, default: "" },
    assignedEmployees: [
      {
        empId: String,
        name: String,
        role: String,
      },
    ],
    startDate: { type: String, required: true },
    deadline: { type: String, required: true },
    budget: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Under Review", "Completed", "On Hold"],
      default: "In Progress",
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    techStack: [{ type: String }],
    deliverablesUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
