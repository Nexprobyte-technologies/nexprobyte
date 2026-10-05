import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Job } from "./models/Job.js";
import { About } from "./models/About.js";

dotenv.config();

async function seed() {
  const connected = await connectDB();
  if (!connected) {
    console.error("PostgreSQL not connected. Check your PG_URI/DATABASE_URL in .env");
    process.exit(1);
  }

  // Create Admin
  const admin = await User.findOneAndUpdate(
    { username: "NexAdmin" },
    { username: "NexAdmin", password: "Nex@.1A", name: "Nexpro Admin", role: "admin" },
    { upsert: true, new: true }
  );
  console.log("✅ Admin Seeded:", admin.username);

  // Seed default About
  const aboutCount = await About.countDocuments();
  if (aboutCount === 0) {
    await About.create({
      eyebrow: "WHO WE ARE",
      title: "We Build Digital Products That Scale",
      subtitle:
        "Nexprobyte Technologies is a digital agency based in Coimbatore, India. We combine technical rigor, thoughtful UI design, and data-driven marketing to help businesses grow.",
      story:
        "Founded with a vision to deliver enterprise-grade digital experiences for ambitious companies, Nexprobyte brings together engineering excellence and design precision.",
      mission:
        "To empower businesses with technology solutions that generate measurable revenue, elevate brand presence, and scale seamlessly.",
      vision:
        "To be the premier digital transformation partner for startups, SMEs, and global enterprises.",
      stats: [
        { label: "Projects Completed", value: "120+" },
        { label: "Client Satisfaction", value: "99%" },
        { label: "Team Specialists", value: "25+" },
        { label: "Years Experience", value: "6+" }
      ]
    });
    console.log("✅ About content seeded");
  }

  console.log("🎉 Database seeding complete!");
  process.exit(0);
}

seed();
