import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero.jsx";
import { SectionHead, FadeIn } from "../components/Reveal.jsx";

const PRINCIPLES = [
  {
    num: "01",
    title: "Honest work",
    desc: "No magic promises. Clear scopes, real timelines and straight answers — even when the truth isn't easy to hear.",
  },
  {
    num: "02",
    title: "Own the outcome",
    desc: "We treat every project like our own business. If it doesn't grow revenue or save time, it doesn't ship.",
  },
  {
    num: "03",
    title: "Built to last",
    desc: "Clean code, documented decisions and scalable architecture — so the work keeps paying off long after launch.",
  },
  {
    num: "04",
    title: "Client-first care",
    desc: "A dedicated point of contact, weekly updates and a team that picks up the phone. No layers, no noise.",
  },
];

const STATS = [
  { num: "40+", label: "Projects delivered" },
  { num: "5+", label: "Years of experience" },
  { num: "100%", label: "Client-first approach" },
  { num: "24/7", label: "Support on retainer" },
];

export default function About() {
  const [aboutData, setAboutData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => setAboutData(data))
      .catch((e) => console.error(e));
  }, []);

  const title = aboutData?.title ? [aboutData.title] : ["The people behind", "the pixels"];
  const sub = aboutData?.subtitle || "We're a Coimbatore-based digital solutions studio helping startups and SMEs grow with technology, design and marketing — since day one, strategy first.";
  const story = aboutData?.story || "Nexprobyte was founded with a simple belief: small and mid-sized businesses deserve the same digital firepower as enterprises. We bridge that gap with a senior, honest team that ships.";
  const statsList = aboutData?.stats?.length > 0 ? aboutData.stats : STATS;

  return (
    <>
      <PageHero
        num="About"
        label="Nexprobyte Technologies"
        title={title}
        sub={sub}
      />

      <section className="section wrap">
        <SectionHead num="01" label="Our story" title="Built on principles" />

        <div className="detail-cols" style={{ paddingBottom: 0 }}>
          <div>
            <p className="lead-p" style={{ marginTop: 8 }}>
              {story}
            </p>
          </div>
          <ul className="check-list">
            {[
              "Strategy-first engagements",
              "Senior team, no hand-offs",
              "Design, code & marketing under one roof",
              "Measurable results on every project",
            ].map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="tick">✦</span> {f}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="grid cols-2">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.num}
              className="cell"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="idx">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="about-stats">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="about-stat"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <b>{s.num}</b>
              <span>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <FadeIn className="services-cta">
          <h2>
            Let's build what's next for your business.
          </h2>
          <Link to="/contact" className="btn btn-solid">
            Start a project <span className="arr">→</span>
          </Link>
        </FadeIn>
      </section>
    </>
  );
}