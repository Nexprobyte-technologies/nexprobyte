import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SectionHead } from "./Reveal.jsx";
import { SERVICES } from "../data/content.js";

const EASE = [0.22, 1, 0.36, 1];

export function Services() {
  return (
    <section className="section wrap" id="services">
      <SectionHead num="02" label="Our expertise" title="What we do" />
      <div className="rows">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.slug || s.title}
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.06 * i, ease: EASE }}
          >
            <Link to={`/services/${s.slug}`} className="row-exp row-link">
              <span className="r-num">{s.num}</span>
              <h3>
                {s.title} <em className="serif-i">{s.serif}</em>
              </h3>
              <span className="r-desc">
                {s.blurb || s.overview?.slice(0, 80) + "…"}
                <br />
                <span className="link-hint" style={{ color: "var(--accent)", fontSize: "12px", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                  View service →
                </span>
              </span>
              <span className="r-icon">{s.icon || "↗"}</span>
              <img
                className="row-thumb"
                src={s.image || "/images/srv-web.jpg"}
                alt={s.title}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/images/srv-web.jpg";
                }}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}