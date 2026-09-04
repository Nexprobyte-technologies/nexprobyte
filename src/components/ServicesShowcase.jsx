import React, { useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead, FadeIn } from "./Reveal.jsx";
import ShapeGrid from "./ShapeGrid.jsx";

gsap.registerPlugin(ScrollTrigger);

const SHOWCASE = [
  {
    tag: "01",
    title: "SEO Services",
    line: "Rank where it",
    line2: "counts",
    img: "/images/new-seo.jpg",
    desc: "Technical audits, keyword strategy and content that steadily climb the rankings — measured, sustainable and built to last.",
    bullets: ["Technical SEO audits", "Keyword & content strategy", "Local SEO & link building"],
  },
  {
    tag: "02",
    title: "Digital Marketing",
    line: "Growth you can",
    line2: "measure",
    img: "/images/new-marketing.jpg",
    desc: "Performance campaigns across Google and Meta, tuned with real data to turn spend into customers.",
    bullets: ["Google & Meta ads", "Landing page funnels", "CRO & attribution"],
  },
  {
    tag: "03",
    title: "Software & App Development",
    line: "Products that",
    line2: "scale",
    img: "/images/new-software.jpg",
    desc: "From web apps to native mobile apps — robust architecture, clean code and experiences users love.",
    bullets: ["Full-stack web apps", "iOS & Android", "Cloud & integrations"],
  },
  {
    tag: "04",
    title: "UI/UX Design",
    line: "Interfaces people",
    line2: "understand",
    img: "/images/new-uiux.jpg",
    desc: "Research-backed, accessible and delightful. We turn messy problems into clean, intuitive flows.",
    bullets: ["UX research & flows", "Design systems", "Prototyping & testing"],
  },
  {
    tag: "05",
    title: "n8n Automation",
    line: "Manual work,",
    line2: "automated",
    img: "/images/new-automation.jpg",
    desc: "We connect your apps and remove repetitive work with n8n workflows — freeing your team for what matters.",
    bullets: ["Workflow automation", "App integrations (400+)", "AI-powered agent flows"],
  },
  {
    tag: "06",
    title: "AI-Powered Solutions",
    line: "Smarter ways to",
    line2: "work",
    img: "/images/new-ai.jpg",
    desc: "Custom AI assistants, chatbots and content pipelines that bring the power of modern AI into your everyday operations.",
    bullets: ["Custom AI assistants", "Chatbots & copilots", "AI content pipelines"],
  },
];

export function ServicesShowcase() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {

      // parallax on each showcase image
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el.querySelector("img"),
          { y: -30 },
          {
            y: 30,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      });

      // staggered reveal of showcase rows
      gsap.utils.toArray("[data-show-row]").forEach((row, i) => {
        gsap.from(row, {
          y: 70,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section showcase-section" id="deep-services" ref={sectionRef}>
      <div className="wrap">
        <SectionHead num="05" label="Capabilities" title="What we do, in depth" />

        <FadeIn className="showcase-intro">
          <p>
            Beyond strategy, we ship the exact disciplines most businesses need to grow online.
            Pick any capability and we'll handle it end-to-end.
          </p>
        </FadeIn>
      </div>

      {/* World map band */}
      <div className="world-band" ref={contentRef}>
        <ShapeGrid
          direction="right"
          speed={0.5}
          borderColor="rgba(255,255,255,0.07)"
          squareSize={50}
          hoverFillColor="rgba(255,255,255,0.03)"
          shape="square"
          className="world-map"
        />
        <div className="wrap">
          <span className="world-caption eyebrow">
            <span className="num">✦</span>
            Trusted by businesses from Coimbatore to the world
          </span>
        </div>
      </div>

      <div className="wrap showcase-list">
        {SHOWCASE.map((s, i) => (
          <div className="showcase-row" key={s.title} data-show-row>
            <div className="showcase-media" data-parallax>
              <img src={s.img} alt={s.title} loading="lazy" />
              <span className="showcase-index">{s.tag}</span>
            </div>
            <div className="showcase-text">
              <span className="eyebrow">
                <span className="num">{s.tag}</span>
                <span>{s.title}</span>
              </span>
              <h3 className="showcase-title">
                {s.line} <em className="italic-serif">{s.line2}</em>
              </h3>
              <p>{s.desc}</p>
              <ul>
                {s.bullets.map((b) => (
                  <li key={b}>
                    <span className="tick">✦</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}