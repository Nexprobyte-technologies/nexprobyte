import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { RevealLines } from "./Reveal.jsx";
import DarkVeil from "./DarkVeil.jsx";

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section className="hero wrap" id="top" ref={ref}>
      <div className="hero-background">
        <DarkVeil
          speed={0.6}
          hueShift={20}
          noiseIntensity={0.03}
          scanlineIntensity={0.1}
          warpAmount={0.2}
          resolutionScale={1}
        />
      </div>
      <motion.div style={{ opacity: fade, position: "relative", zIndex: 2 }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="num">CB641006</span>
          <span>Coimbatore, India</span>
        </motion.p>

        <h1 className="hero-headline h-display">
          <RevealLines
            lines={["We Build", "Digital Solutions"]}
            delay={0.25}
            className="h-display"
            lineClass="h-display"
          />
          <span style={{ display: "block", overflow: "hidden", paddingTop: "0.02em" }}>
            <motion.span
              style={{ display: "inline-block" }}
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              That Help <em className="italic-serif" style={{ fontSize: "1.1em" }}>Businesses</em>{" "}
              Grow
            </motion.span>
          </span>
        </h1>

        <div className="hero-sub">
          <p style={{ maxWidth: "58ch" }}>
            Nexprobyte Technologies is a digital marketing agency and software development company in
            Coimbatore — helping startups and SMEs grow with web development, SEO, performance ads and
            AI automation.
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-solid">
              Contact Us <span className="arr">→</span>
            </a>
            <a href="#work" className="btn btn-ghost">
              Explore More
            </a>
          </div>
        </div>
      </motion.div>

      <div className="hero-media">
        <motion.div
          className="media-inner"
          style={{ y, scale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/images/hero.jpg"
            alt="Nexprobyte team at work on digital solutions"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="1200"
            height="900"
          />
        </motion.div>
        <span className="tag">Est. Coimbatore</span>
        <span className="coords">10.9997° N, 76.9701° E</span>
      </div>
    </section>
  );
}