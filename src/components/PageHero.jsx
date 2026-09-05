import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import DarkVeil from "./DarkVeil.jsx";

const EASE = [0.22, 1, 0.36, 1];

export function PageHero({ num, label, title, sub, children }) {
  return (
    <section className="page-hero wrap">
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
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="eyebrow"
      >
        <span className="num">{num}</span>
        <span>{label}</span>
      </motion.div>

      <h1 className="page-title h-display">
        {title.map((l, i) => (
          <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.03em" }}>
            <motion.span
              style={{ display: "inline-block" }}
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.2 + i * 0.09, ease: EASE }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </h1>

      {sub && (
        <motion.p
          className="page-sub"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
        >
          {sub}
        </motion.p>
      )}

      {children}
    </section>
  );
}

export function Breadcrumb({ items }) {
  return (
    <motion.div
      className="crumbs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.to ? (
            <Link to={it.to}>{it.label}</Link>
          ) : (
            <span className="cur">{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
}

export function Prose({ content, delay = 0 }) {
  return (
    <div className="prose">
      {content.map((block, i) => {
        const d = delay + i * 0.05;
        if (block.h) {
          return (
            <motion.h2
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: d, ease: EASE }}
            >
              {block.h}
            </motion.h2>
          );
        }
        if (block.p) {
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: d, ease: EASE }}
            >
              {block.p}
            </motion.p>
          );
        }
        if (block.ul) {
          return (
            <motion.ul
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: d, ease: EASE }}
            >
              {block.ul.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </motion.ul>
          );
        }
        if (block.links) {
          return (
            <motion.div
              key={i}
              className="prose-links"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: d, ease: EASE }}
            >
              <span className="prose-links-title">Recommended resources</span>
              <ul>
                {block.links.map((l, j) => (
                  <li key={j}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        }
        return null;
      })}
    </div>
  );
}