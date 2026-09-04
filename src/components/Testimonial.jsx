import React from "react";
import { FadeIn, RevealText } from "./Reveal.jsx";

export function Testimonial() {
  return (
    <section className="section wrap">
      <div className="testimonial">
        <div className="bg-halo" />
        <FadeIn delay={0.05}>
          <span className="quote-mark">“</span>
        </FadeIn>
        <RevealText
          text="Amazing Designs and Quality Work!"
          as="blockquote"
          stagger={0.02}
          amount={0.6}
          style={{ display: "block" }}
        />
        <FadeIn delay={0.15}>
          <div className="author">
            <img
              className="avatar"
              src="/images/testimonial.jpg"
              alt="Portrait of Raj Kumar"
              loading="lazy"
            />
            <div>
              <b>Raj Kumar</b>
              <span>Managing Director</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}