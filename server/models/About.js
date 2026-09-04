import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "WHO WE ARE" },
    title: { type: String, default: "We Build Digital Products That Scale" },
    subtitle: {
      type: String,
      default:
        "Nexprobyte Technologies is a digital agency based in Coimbatore, India. We combine technical rigor, thoughtful UI design, and data-driven marketing to help businesses grow.",
    },
    story: {
      type: String,
      default:
        "Founded with a vision to deliver enterprise-grade digital experiences for ambitious companies, Nexprobyte brings together engineering excellence and design precision.",
    },
    mission: {
      type: String,
      default:
        "To empower businesses with technology solutions that generate measurable revenue, elevate brand presence, and scale seamlessly.",
    },
    vision: {
      type: String,
      default:
        "To be the premier digital transformation partner for startups, SMEs, and global enterprises.",
    },
    stats: [
      { label: { type: String }, value: { type: String } },
    ],
    values: [
      { title: { type: String }, description: { type: String } },
    ],
  },
  { timestamps: true }
);

export const About = mongoose.models.About || mongoose.model("About", aboutSchema);
