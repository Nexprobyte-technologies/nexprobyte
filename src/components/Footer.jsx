import React from "react";
import { Link } from "react-router-dom";
import { FadeIn } from "./Reveal.jsx";

const COMPANY = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Careers", to: "/careers" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const SERVICES = [
  "Website Development",
  "Mobile App Development",
  "Application Development",
  "UI/UX Design",
  "Branding & Identity",
  "Digital Marketing & SEO",
  "Social Media Marketing",
];

const SOCIALS = [
  { key: "f", label: "Facebook", href: "#" },
  { key: "X", label: "X (Twitter)", href: "#" },
  { key: "in", label: "LinkedIn", href: "https://www.linkedin.com/in/nextprobytetechnologies" },
  { key: "ig", label: "Instagram", href: "#" },
];

export function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer-grid">
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <img
              src="/images/nxtpro-logo.png"
              alt="Nexprobyte Logo"
              style={{ height: "48px", width: "auto", objectFit: "contain" }}
            />
          </div>
          <p className="f-desc">
            Nexprobyte Technologies is a digital marketing agency and software development company in
            Coimbatore. We help startups and SMEs grow with website development, SEO, social media
            marketing and AI-powered automation.
          </p>
          <div className="socials">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="social"
                aria-label={`${s.label} profile`}
              >
                {s.key}
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h4>Company</h4>
          <ul>
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.16}>
          <h4>Business</h4>
          <ul>
            {SERVICES.map((s) => (
              <li key={s}>
                <Link to="/services">{s}</Link>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.24}>
          <h4>Get In Touch</h4>
          <ul style={{ gap: 18 }}>
            <li>
              <a
                href="https://maps.google.com/?q=+10.9994017,76.9686834"
                target="_blank"
                rel="noreferrer"
                style={{ lineHeight: 1.6 }}
              >
                1st Floor, Nanjiammal Complex, Above City Bakery, Maniyakarampalayam, Coimbatore,
                Tamil Nadu 641006
              </a>
            </li>
            <li>
              <a href="mailto:info@nexprobyte.com">info@nexprobyte.com</a>
            </li>
            <li>
              <a href="tel:+919500042426">+91 95000 42426</a>
            </li>
          </ul>
        </FadeIn>
      </div>

      {/* Center Emblem with White Background over the Divider Line */}
      <div className="footer-divider-badge-wrap">
        <a
          href="https://en.wikipedia.org/wiki/Coimbatore"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-divider-badge"
          title="Explore Coimbatore on Wikipedia"
          aria-label="Coimbatore Wikipedia"
        >
          <img
            src="/assets/cropped-cbe-blue-logo-5.png"
            alt="Coimbatore Emblem"
            className="footer-center-emblem"
          />
        </a>
      </div>

      <div className="base">
        <span style={{ alignSelf: "center" }}>
          Copyright © 2026 Nexprobyte Technologies. All rights reserved.
        </span>
        <span style={{ alignSelf: "center" }}>Made with Motion in Coimbatore ✦</span>
      </div>
    </footer>
  );
}