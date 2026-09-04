import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGSAPScroll() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Fade-up reveal for any element marked [data-gsap-fade]
      gsap.utils.toArray("[data-gsap-fade]").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%" },
          }
        );
      });

      // Parallax drift on marquees tied to scroll
      gsap.utils.toArray("[data-marquee-parallax]").forEach((m) => {
        const track = m.querySelector(".marquee-track");
        if (!track) return;
        const speed = m.dataset.marqueeParallax === "fast" ? 160 : 80;
        gsap.fromTo(
          track,
          { xPercent: 0 },
          {
            xPercent: -speed,
            ease: "none",
            scrollTrigger: {
              trigger: m,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return rootRef;
}

export function GSAPScrollEngine() {
  const ref = useGSAPScroll();
  return <div ref={ref} className="gsap-engine" aria-hidden="true" />;
}