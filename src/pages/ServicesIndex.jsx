import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero.jsx";
import { SERVICES } from "../data/content.js";

export default function ServicesIndex() {
  return (
    <>
      <PageHero
        num="Services"
        label="What we do"
        title={["Everything you need,", "under one roof"]}
        sub="Six integrated disciplines. One accountable team. Strategy, design, development and marketing that work together instead of in silos."
      />

      <section className="section wrap" style={{ paddingTop: 40 }}>
        <div className="rows">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/services/${s.slug}`} className="row-exp row-link">
                <span className="r-num">{s.num}</span>
                <h3>
                  {s.title} <em className="serif-i">{s.serif}</em>
                </h3>
                <span className="r-desc">
                  {s.blurb}
                  <br />
                  <span className="link-hint">View service →</span>
                </span>
                <span className="r-icon">{s.icon}</span>
                <img className="row-thumb" src={s.image} alt={s.title} loading="lazy" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="services-cta">
          <h2>
            Not sure what you need? <em className="italic-serif">Start with a conversation.</em>
          </h2>
          <Link to="/contact" className="btn btn-solid">
            Get a free consultation <span className="arr">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}