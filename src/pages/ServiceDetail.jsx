import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero, Breadcrumb } from "../components/PageHero.jsx";
import { SERVICES } from "../data/content.js";

const EASE = [0.22, 1, 0.36, 1];

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = SERVICES.find((x) => x.slug === slug);

  if (!s) return <Navigate to="/services" replace />;

  return (
    <>
      <PageHero
        num={`Service ${s.num}`}
        label={s.title}
        title={[s.serif, "that ships"]}
        sub={s.blurb}
      >
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Services", to: "/services" },
            { label: s.title },
          ]}
        />
      </PageHero>

      <section className="section wrap" style={{ paddingTop: 30 }}>
        <div className="detail-top">
          <motion.div
            className="detail-art"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          >
            <img src={s.image} alt={s.title} loading="eager" />
          </motion.div>
          <motion.div
            className="detail-summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <h2>{s.overview}</h2>
            <div className="btn-row">
              <Link to="/contact" className="btn btn-solid">
                Start this project <span className="arr">→</span>
              </Link>
              <Link to="/work" className="btn btn-ghost">
                See our work
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="detail-cols" style={{ paddingTop: 64 }}>
          <div>
            <div className="eyebrow">
              <span className="num">01</span>
              <span>What's included</span>
            </div>
            <ul className="check-list">
              {s.features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE }}
                >
                  <span className="tick">✦</span> {f}
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">
              <span className="num">02</span>
              <span>What you receive</span>
            </div>
            <div className="deliver-grid">
              {s.deliverables.map((d, i) => (
                <motion.div
                  key={d}
                  className="deliver"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.06 * i, ease: EASE }}
                >
                  <span className="deliver-num">0{i + 1}</span>
                  {d}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="other-services">
          <div className="eyebrow">
            <span className="num">03</span>
            <span>Explore other services</span>
          </div>
          <div className="pill-row">
            {SERVICES.filter((x) => x.slug !== slug).map((x) => (
              <Link key={x.slug} to={`/services/${x.slug}`} className="pill">
                {x.title} <span className="arr">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}