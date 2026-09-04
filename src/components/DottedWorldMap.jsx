import React, { forwardRef, useMemo } from "react";
import { WORLD_DOTS, WORLD_W, WORLD_H } from "../data/worldDots.js";

export const DottedWorldMap = forwardRef(function DottedWorldMap(
  { color = "var(--accent)", dot = 2.2, className = "" },
  ref
) {
  const pairs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < WORLD_DOTS.length; i += 2) {
      arr.push([WORLD_DOTS[i], WORLD_DOTS[i + 1]]);
    }
    return arr;
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {pairs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={dot} fill={color} />
      ))}
    </svg>
  );
});