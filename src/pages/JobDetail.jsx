import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero, Breadcrumb } from "../components/PageHero.jsx";
import { JOBS } from "../data/content.js";

const EASE = [0.22, 1, 0.36, 1];

export default function JobDetail() {
  const { slug } = useParams();
  const j = JOBS.find((x) => x.slug === slug);

  if (!j) return <Navigate to="/careers" replace />;

  const more = JOBS.filter((x) => x.slug !== slug).slice(0, 2);

  return (
    <>
      <PageHero
        num={j.dept}
        label={`${j.location} · ${j.type}`}
        title={[j.title]}
        sub={j.excerpt}
      >
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Careers", to: "/careers" },
            { label: j.title },
          ]}
        />
      </PageHero>

      <section className="section wrap" style={{ paddingTop: 20 }}>
        <div className="job-applybar">
          <div className="job-tags">
            <span className="mini-tag">{j.dept}</span>
            <span className="mini-tag">{j.location}</span>
            <span className="mini-tag">{j.type}</span>
            <span className="mini-tag accent-tag">{j.salary}</span>
          </div>
          <Link to={`/careers/${j.slug}/apply`} className="btn btn-solid">
            Apply for this role <span className="arr">→</span>
          </Link>
        </div>

        <div className="detail-art" style={{ marginTop: 40 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            style={{
              width: "100%",
              aspectRatio: "21 / 9",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(255, 77, 109, 0.15), rgba(139, 92, 246, 0.15))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "56px" }}>
              {j.title.toLowerCase().includes("frontend") || j.title.toLowerCase().includes("react") ? "⚛️" :
               j.title.toLowerCase().includes("wordpress") ? "🌐" :
               j.title.toLowerCase().includes("design") || j.title.toLowerCase().includes("ui") ? "🎨" :
               j.title.toLowerCase().includes("full stack") || j.title.toLowerCase().includes("node") ? "⚡" : "💼"}
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>
              {j.title}
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <span className="mini-tag accent-tag">{j.dept}</span>
              <span className="mini-tag">{j.location}</span>
              <span className="mini-tag">{j.type}</span>
              <span className="mini-tag">{j.salary}</span>
            </div>
          </motion.div>
        </div>

        <div className="detail-cols" style={{ paddingTop: 64 }}>
          <div>
            <div className="eyebrow">
              <span className="num">01</span>
              <span>What you'll do</span>
            </div>
            <ul className="check-list">
              {j.responsibilities.map((r, i) => (
                <motion.li
                  key={r}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.04 * i, ease: EASE }}
                >
                  <span className="tick">✦</span> {r}
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">
              <span className="num">02</span>
              <span>What we look for</span>
            </div>
            <ul className="check-list">
              {j.requirements.map((r, i) => (
                <motion.li
                  key={r}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.04 * i, ease: EASE }}
                >
                  <span className="tick">✦</span> {r}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 40 }}>
        <div className="eyebrow">
          <span className="num">✦</span>
          <span>Other open roles</span>
        </div>
        <div className="jobs-list" style={{ marginTop: 24 }}>
          {more.map((m, i) => (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
            >
              <Link to={`/careers/${m.slug}`} className="job-row">
                <div className="job-main">
                  <h3>{m.title}</h3>
                  <p>{m.excerpt}</p>
                </div>
                <div className="job-tags">
                  <span className="mini-tag">{m.dept}</span>
                  <span className="mini-tag">{m.location}</span>
                </div>
                <span className="r-icon">↗</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}