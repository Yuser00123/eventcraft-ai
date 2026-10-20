"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  /** Completion percentage 0–100. */
  percent: number;
  size?: number;
  label?: string;
  stroke?: string;
}

/** Animated SVG progress ring with an accessible text fallback. */
export function ProgressRing({
  percent,
  size = 108,
  label,
  stroke = "#E04A1F",
}: ProgressRingProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${clamped} percent complete${label ? `, ${label}` : ""}`}
        className="-rotate-90"
      >
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#FFFFFF" strokeWidth="11" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute font-display text-2xl font-extrabold">{clamped}%</span>
    </div>
  );
}
