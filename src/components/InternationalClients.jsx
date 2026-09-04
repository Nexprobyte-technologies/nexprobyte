import React from "react";
import { RevealText, FadeIn } from "./Reveal.jsx";

export function InternationalClients() {
  return (
    <section className="section international-section" id="global">
      <div className="international-text">
        <FadeIn className="section-head">
          <span className="eyebrow">
            <span className="num">✦</span>
            <span>Global reach</span>
          </span>
          <RevealText
            text="We Welcome International Clients"
            as="h2"
            className="h-mid"
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <p>
            From Coimbatore to the world — Nexprobyte partners with businesses  across borders, delivering the same quality, speed and care no matter
            where you're based. Fully remote-friendly, timezone-aware and built
            for global collaboration.
          </p>
        </FadeIn>
      </div>

      <div className="international-img" data-cursor>
        <img
          src="/images/world-map.png"
          alt="World map showing global reach"
          loading="lazy"
        />
        <div className="gps-markers">
          <div className="gps-dot" style={{ left: "29%", top: "28%" }}>
            <span className="gps-pulse"></span>
            <span className="gps-label">America</span>
          </div>
          <div className="gps-dot" style={{ left: "44%", top: "14%" }}>
            <span className="gps-pulse"></span>
            <span className="gps-label">Iceland</span>
          </div>
          <div className="gps-dot" style={{ left: "50%", top: "22%" }}>
            <span className="gps-pulse"></span>
            <span className="gps-label">London</span>
          </div>
          <div className="gps-dot" style={{ left: "64%", top: "36%" }}>
            <span className="gps-pulse"></span>
            <span className="gps-label">Qatar</span>
          </div>
          <div className="gps-dot" style={{ left: "66%", top: "34%" }}>
            <span className="gps-pulse"></span>
            <span className="gps-label">Dubai</span>
          </div>
        </div>
      </div>
    </section>
  );
}