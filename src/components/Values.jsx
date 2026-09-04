import React from "react";
import { motion } from "motion/react";
import { RevealText, SectionHead } from "./Reveal.jsx";

const VALUES = [
  { icon: "🎯", title: "Customer First", desc: "We listen, understand and build solutions that truly solve problems." },
  { icon: "💡", title: "Innovation", desc: "We embrace new ideas and technologies to keep you ahead of the curve." },
  { icon: "🔎", title: "Transparency", desc: "Open communication and honest work in every engagement." },
  { icon: "🏅", title: "Quality", desc: "We are committed to delivering quality that you can rely on." },
  { icon: "✂️", title: "Simplicity", desc: "Simple processes and clean design for a better user experience." },
  { icon: "📈", title: "Long-Term Growth", desc: "We grow together with our clients and their business goals." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cell = {
  hidden: { opacity: 0, y: 42 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export function Values() {
  return (
    <section className="section wrap" id="about">
      <SectionHead num="01" label="What drives us" title="Built on principles" />
      <motion.div className="grid cols-3" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }}>
        {VALUES.map((v, i) => (
          <motion.div key={v.title} className="cell" variants={cell}>
            <span className="idx">0{i + 1}</span>
            <span className="icon">{v.icon}</span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}