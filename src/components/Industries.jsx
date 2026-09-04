import React from "react";
import { motion } from "motion/react";
import { RevealText, SectionHead } from "./Reveal.jsx";

const INDUSTRIES = [
  "🏭 Manufacturing",
  "⚙️ CNC & Engineering",
  "🚀 Startups",
  "🏢 SMEs",
  "🛒 E-Commerce",
];

export function Industries() {
  return (
    <section className="section wrap">
      <SectionHead num="03" label="Businesses we support" title="Who we work with" />
      <RevealText
        text="From the factory floor to the storefront, we build for every stage of growth."
        className="h-mid"
        style={{ maxWidth: "20ch", display: "block" }}
      />
      <div className="pills">
        {INDUSTRIES.map((name, i) => (
          <motion.span
            key={name}
            className="pill"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {name}
          </motion.span>
        ))}
      </div>
    </section>
  );
}