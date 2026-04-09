/**
 * Shared constants, color tokens, animation presets, and helper components
 * for the HomePage section components.
 */

import { motion, useMotionValue, useInView, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

/* ── Colour Tokens ─────────────────────────────────────────── */
export const C = {
  pageBg: "#ffffff",
  sectionAlt: "#f9fafb",
  primary: "#0a66c2",
  primaryHover: "#004182",
  primaryLight: "#e8f0fe",
  primaryBorder: "#8bb9fe",
  textDark: "#0f172a",
  textMuted: "#475569",
  textDim: "#64748b",
  border: "#e2e8f0",
  darkBg: "#020617",
  darkSurface: "#0f172a",
  darkText: "#f8fafc",
  darkMuted: "#94a3b8",
  darkBorder: "#1e293b",
  cardShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)",
  glow: "0 0 24px rgba(10, 102, 194, 0.25)",
};

/* ── Animation Presets ─────────────────────────────────────── */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

export const inView = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

/* ── Navigation Button ─────────────────────────────────────── */
export function NavBtn({ children, onClick, filled, icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-all duration-300 ${filled ? "text-white shadow-lg shadow-blue-500/20" : "text-gray-700 bg-white border border-gray-200"
        }`}
      style={{
        backgroundColor: filled ? C.primary : "white",
      }}
      whileHover={{
        y: -1,
        backgroundColor: filled ? C.primaryHover : C.sectionAlt,
        boxShadow: filled ? "0 8px 20px -4px rgba(10, 102, 194, 0.4)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {children}
      {icon && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </motion.button>
  );
}

/* ── Counter (animated number) ─────────────────────────────── */
export function Counter({ from = 0, to, duration = 2 }) {
  const count = useMotionValue(from);
  const [display, setDisplay] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const animation = animate(count, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });
    return animation.stop;
  }, [isInView, count, to, duration]);

  return <span ref={ref}>{display}</span>;
}
