import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero.jsx";
import { JOBS } from "../data/content.js";

const PERKS = [
  "Competitive salary & yearly reviews",
  "Flexible hours & remote-friendly",
  "Learning budget for courses & tools",
  "Real client work from month one",
  "Friday demos & team builds",
  "Referral & performance bonuses",
];

function getJobMeta(title = "", dept = "") {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("react"))
    return { icon: "⚛️", bg: "linear-gradient(135deg, #0369a1, #0284c7)", tag: "React / Web", label: "Frontend" };
  if (t.includes("wordpress") || t.includes("php"))
    return { icon: "🌐", bg: "linear-gradient(135deg, #1d4ed8, #2563eb)", tag: "WP / PHP", label: "WordPress" };
  if (t.includes("designer") || t.includes("ui") || t.includes("ux"))
    return { icon: "🎨", bg: "linear-gradient(135deg, #db2777, #7c3aed)", tag: "UI / UX", label: "Design" };
  if (t.includes("full stack") || t.includes("backend") || t.includes("node"))
    return { icon: "⚡", bg: "linear-gradient(135deg, #059669, #10b981)", tag: "Full Stack", label: "Backend" };
  if (t.includes("mobile") || t.includes("app") || t.includes("flutter") || t.includes("ios") || t.includes("android"))
    return { icon: "📱", bg: "linear-gradient(135deg, #6366f1, #4f46e5)", tag: "Mobile / App", label: "Mobile" };
  if (t.includes("marketing") || t.includes("seo") || t.includes("growth"))
    return { icon: "📈", bg: "linear-gradient(135deg, #ea580c, #f97316)", tag: "Marketing", label: "Growth" };
  return { icon: "💼", bg: "linear-gradient(135deg, #ff4d6d, #8b5cf6)", tag: dept || "Engineering", label: "Engineering" };
}

export default function Careers() {
  const [jobsList, setJobsList] = React.useState(JOBS);

  React.useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobsList(data.filter((j) => j.active !== false));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <>
      <PageHero
        num="Careers"
        label="Join the team"
        title={["Do great work,", "grow with it"]}
        sub="Nexprobyte is a small, senior-friendly team in Coimbatore. We value deep work, honest feedback and people who ship."
      />

      <section className="section wrap" style={{ paddingTop: 40 }}>
        <div className="detail-cols" style={{ paddingBottom: 48 }}>
          <div>
            <div className="eyebrow">
              <span className="num">✦</span>
              <span>Why join us</span>
            </div>
            <p className="lead-p" style={{ marginTop: 18 }}>
              You won't be a cog. You'll own real outcomes — from the first conversation to the
              final launch — and build the kind of portfolio that makes the next move easy.
            </p>
          </div>
          <ul className="check-list">
            {PERKS.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="tick">✦</span> {f}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>
          <span className="num">Open roles</span>
          <span>{jobsList.length} positions</span>
        </div>

        <div className="jobs-list">
          {jobsList.map((j, i) => {
            const meta = getJobMeta(j.title, j.dept);
            return (
              <motion.div
                key={j.slug || j.id || j._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/careers/${j.slug}`} className="job-row">
                  <div className="job-img">
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "14px",
                        background: meta.bg,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }}
                    >
                      <span style={{ fontSize: "30px", lineHeight: 1 }}>{meta.icon}</span>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 800,
                          color: "#ffffff",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {meta.tag}
                      </span>
                    </div>
                  </div>
                  <div className="job-main">
                    <h3>{j.title}</h3>
                    <p>{j.excerpt}</p>
                  </div>
                  <div className="job-tags">
                    <span className="mini-tag">{j.dept}</span>
                    <span className="mini-tag">{j.location}</span>
                    <span className="mini-tag">{j.type}</span>
                  </div>
                  <span className="r-icon">↗</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="jobs-empty">
          <h2>
            Don't see your role? <em className="italic-serif">We still want to hear from you.</em>
          </h2>
          <p>
            Great people create roles. Send your portfolio and a short note about what you'd build
            here — we reply to every application.
          </p>
          <Link to="/careers/apply" className="btn btn-solid">
            Apply speculatively <span className="arr">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}