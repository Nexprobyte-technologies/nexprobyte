import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { RevealText } from "./Reveal.jsx";

export function CTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section className="section wrap" id="contact" ref={ref}>
      <div className="cta-band">
        <motion.svg
          className="cta-lines"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          style={{ x, width: "110%", height: "100%" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M ${i * 160} 400 C ${i * 160 + 40} 250, ${i * 160 + 120} 150, ${i * 160 + 160} 0`}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
            />
          ))}
        </motion.svg>

        <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
          <span className="num" style={{ color: "#fff" }}>
            ✦
          </span>
          <span>Let’s talk</span>
        </span>

        <RevealText
          text="Have a project in mind?"
          as="h2"
          amount={0.5}
        />
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Let’s create something amazing together. Tell us where you are — we’ll bring the roadmap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <a href="mailto:info@nexprobyte.com" className="btn btn-light">
            Start a project <span className="arr">→</span>
          </a>
          <a
            href="tel:+919500042426"
            className="btn"
            style={{ marginLeft: 12, color: "#fff", borderColor: "rgba(255,255,255,.4)" }}
          >
            +91 95000 42426
          </a>
        </motion.div>
      </div>
    </section>
  );
}