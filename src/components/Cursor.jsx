import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const SPRING = { damping: 25, stiffness: 180, mass: 0.5 };

export function Cursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const circleX = useSpring(mouseX, SPRING);
  const circleY = useSpring(mouseY, SPRING);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    const interactiveEls = "a, button, [data-cursor]";
    const handleOver = (e) => {
      if (e.target.closest(interactiveEls)) setHovering(true);
    };
    const handleOut = (e) => {
      if (e.target.closest(interactiveEls)) setHovering(false);
    };

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [mouseX, mouseY, visible]);

  return (
    <>
      <div className="custom-cursor" style={{ cursor: "none" }} />
      <motion.div
        className="cursor-dot"
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ x: mouseX, y: mouseY }}
      />
      <motion.div
        className="cursor-ring"
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1.8 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ x: circleX, y: circleY }}
      />
    </>
  );
}
