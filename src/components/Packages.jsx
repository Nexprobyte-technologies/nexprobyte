import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionHead } from "./Reveal.jsx";

const EASE = [0.22, 1, 0.36, 1];

const PACKAGES = [
  {
    name: "Starter",
    tag: "For startups & local businesses",
    price: "₹24,999",
    per: "one-time setup*",
    palette: "cobalt",
    summary: [
      "5-page responsive website",
      "Basic on-page SEO setup",
      "Mobile-first design",
      "Contact form + WhatsApp link",
      "2 free revisions",
    ],
    extra: {
      title: "What's included when you go deeper",
      bullets: [
        "Google Business Profile setup",
        "Basic Google Analytics + Search Console",
        "Free SSL + hosting guidance",
        "Delivery within 14 days",
        "1 month post-launch support",
      ],
      note: "*Domain & hosting billed separately.",
    },
  },
  {
    name: "Growth",
    tag: "For SMEs that want to scale",
    price: "₹49,999",
    per: "one-time setup*",
    palette: "fire",
    summary: [
      "Up to 10 pages + blog",
      "Full SEO audit & keyword plan",
      "Digital marketing kickoff (Google & Meta ads)",
      "Speed & Core Web Vitals optimisation",
      "2 months free support",
    ],
    extra: {
      title: "Everything in Starter, plus",
      bullets: [
        "Conversion-focused landing pages",
        "Email + WhatsApp automation setup",
        "Monthly performance report",
        "Priority delivery within 21 days",
        "Dedicated account manager",
      ],
      note: "*Monthly ads & retainer billed separately.",
    },
  },
];

function PackageCard({ pkg, i }) {
  const [more, setMore] = useState(false);

  return (
    <motion.article
      className={`package-card is-${pkg.palette}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.85, delay: 0.1 * i, ease: EASE }}
    >
      <div className="package-card-top">
        <div>
          <h3>{pkg.name}</h3>
          <p>{pkg.tag}</p>
        </div>
        <span className="package-num">0{i + 1}</span>
      </div>

      <div className="package-price">
        <span className="package-price-value">{pkg.price}</span>
        <span className="package-price-per">{pkg.per}</span>
      </div>

      <ul className="package-summary">
        {pkg.summary.map((s) => (
          <li key={s}>
            <span className="tick">✦</span> {s}
          </li>
        ))}
      </ul>

      <AnimatePresence initial={false}>
        {more && (
          <motion.div
            className="package-extra"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="package-extra-inner">
              <b>{pkg.extra.title}</b>
              <ul>
                {pkg.extra.bullets.map((b) => (
                  <li key={b}>
                    <span className="tick">✦</span> {b}
                  </li>
                ))}
              </ul>
              <p className="package-extra-note">{pkg.extra.note}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={`package-more ${more ? "is-open" : ""}`}
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
      >
        {more ? "Less" : "More"} <span className="arr">{more ? "−" : "+"}</span>
      </button>

      <a href="#contact" className="btn btn-solid package-btn">
        Choose {pkg.name} <span className="arr">→</span>
      </a>
    </motion.article>
  );
}

export function Packages() {
  return (
    <section className="section wrap">
      <SectionHead num="03" label="Simple, transparent plans" title="Our packages" />
      <div className="packages">
        {PACKAGES.map((pkg, i) => (
          <PackageCard key={pkg.name} pkg={pkg} i={i} />
        ))}
      </div>
    </section>
  );
}