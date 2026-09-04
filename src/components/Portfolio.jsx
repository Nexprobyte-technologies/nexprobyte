import React from "react";
import { motion } from "motion/react";
import { SectionHead } from "./Reveal.jsx";

const WORKS = [
  { img: "/images/portfolio-1.jpg", title: "Brand Identity", sub: "Design · 2026" },
  { img: "/images/portfolio-2.jpg", title: "E-Commerce Platform", sub: "Web · 2026" },
  { img: "/images/portfolio-3.jpg", title: "Product Website", sub: "Web · 2025" },
  { img: "/images/portfolio-4.jpg", title: "Mobile App", sub: "Mobile · 2025" },
];

export function Portfolio() {
  return (
    <section className="section wrap" id="work">
      <SectionHead num="04" label="Selected works" title="Our portfolio" />
      <div className="works">
        {WORKS.map((w, i) => (
          <motion.a
            key={w.title}
            href="#contact"
            className="work"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={w.img} alt={w.title} loading="lazy" />
            <div className="meta">
              <b>{w.title}</b>
              <span>{w.sub} — View case study</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}