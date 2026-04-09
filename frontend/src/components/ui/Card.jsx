/**
 * Card — Shared card container for TalentIQ
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card hoverable>Hoverable card</Card>
 *   <Card hoverable accentTop="#0a66c2">With accent line</Card>
 */

import { motion } from "framer-motion";

export default function Card({
  children,
  hoverable = false,
  accentTop,
  className = "",
  padding = "p-5",
  onClick,
  ...props
}) {
  const Wrapper = hoverable ? motion.div : "div";
  const hoverProps = hoverable
    ? {
        whileHover: {
          y: -2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          borderColor: "var(--dark-accent)",
        },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Wrapper
      className={`bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl relative overflow-hidden ${padding} ${hoverable ? "cursor-pointer" : ""} ${className}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {accentTop && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
          style={{ backgroundColor: accentTop }}
        />
      )}
      {children}
    </Wrapper>
  );
}
