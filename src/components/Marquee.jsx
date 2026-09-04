import React from "react";

const ITEMS = [
  "Website Development",
  "Digital Marketing",
  "Application Development",
  "Mobile Apps",
  "SEO Services",
  "Social Media",
  "Brand Design",
  "E-Commerce",
];

export function Marquee({ dark = false, parallax = false, fast = false }) {
  const row = (keyPrefix) => (
    <span className="marquee-item" key={keyPrefix}>
      {ITEMS.map((item, i) => (
        <React.Fragment key={`${keyPrefix}-${i}`}>
          <span>{item}</span>
          <span className="star">✦</span>
        </React.Fragment>
      ))}
    </span>
  );

  return (
    <div
      className={`marquee ${dark ? "on-dark" : ""}`}
      aria-hidden="true"
      data-marquee-parallax={parallax ? (fast ? "fast" : "slow") : undefined}
    >
      <div className="marquee-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}