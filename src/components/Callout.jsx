import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { RevealText, FadeIn } from "./Reveal.jsx";

export function Callout() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section className="callout wrap" ref={ref}>
      <div className="callout-sticky" style={{ position: "sticky", top: 0, alignSelf: "center" }}>
        <div className="callout-text">
          <span className="eyebrow">
            <span className="num">✦</span>
            <span>The Nexprobyte approach</span>
          </span>
          <RevealText
            text="Strategy first. Technology always."
            as="h2"
            stagger={0.06}
          />
          <FadeIn delay={0.1}>
            <p>
              Every engagement starts with understanding your business before a single line of code.
              Then we shape technology, design and marketing around one goal — measurable growth.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <a href="#services" className="btn btn-ghost">
              See our services <span className="arr">→</span>
            </a>
          </FadeIn>
        </div>

        <motion.div className="callout-img" style={{ y }}>
          <img
            src="/images/callout.jpg"
            alt="Design and development strategy session at Nexprobyte"
            loading="lazy"
          />
          <span className="stamp">
            N
            <br />
            B
          </span>
        </motion.div>
      </div>
    </section>
  );
}