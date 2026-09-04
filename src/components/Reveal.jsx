import React, { useMemo } from "react";
import { motion } from "motion/react";

function splitWords(text) {
  return text.split(/(\s+)/).filter(Boolean);
}

const EASE = [0.22, 1, 0.36, 1];

export function RevealText({
  text,
  as = "span",
  delay = 0,
  stagger = 0.04,
  duration = 0.9,
  className = "",
  once = true,
  amount = 0.4,
  style,
}) {
  const words = useMemo(() => splitWords(text), [text]);
  const MotionTag = motion[as] ?? motion.span;

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word = {
    hidden: { y: "115%", rotate: 5 },
    show: {
      y: "0%",
      rotate: 0,
      transition: { duration, ease: EASE },
    },
  };

  const isInline = as === "span" || as === "b" || as === "em";

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      style={{ display: isInline ? "inline-block" : "block", ...style }}
    >
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) {
          return <React.Fragment key={i}>&nbsp;</React.Fragment>;
        }
        return (
          <span key={i} className="word-mask">
            <motion.span variants={word} aria-hidden="true">
              {w.replace(/"/g, "")}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
}

export function RevealLines({ lines, delay = 0, className = "", lineClass = "" }) {
  return (
    <span className={className} style={{ display: "inline-block" }}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.04em", marginBottom: "-0.04em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: delay + i * 0.08, ease: EASE }}
            className={lineClass}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function FadeIn({ children, delay = 0, y = 36, className = "", ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ num, label, title, delay = 0 }) {
  return (
    <FadeIn className="section-head" delay={delay}>
      <span className="eyebrow">
        <span className="num">{num}</span>
        <span>{label}</span>
      </span>
      {title ? <RevealText text={title} as="h2" className="h-mid" /> : null}
    </FadeIn>
  );
}