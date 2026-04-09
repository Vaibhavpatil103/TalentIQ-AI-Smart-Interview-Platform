/**
 * Button — Shared button primitive for TalentIQ
 *
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes:    sm | md | lg
 *
 * Usage:
 *   <Button variant="primary" size="md" onClick={…}>Save</Button>
 *   <Button variant="outline" loading>Processing…</Button>
 */

import { motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-[var(--dark-accent)] text-white hover:bg-[var(--dark-accent-hover)] focus:ring-[var(--dark-accent)] shadow-sm hover:shadow-md hover:shadow-blue-500/15",
  secondary:
    "bg-[var(--dark-elevated)] text-[var(--dark-text)] border border-[var(--dark-border)] hover:border-[var(--dark-accent)] hover:text-[var(--dark-accent)] focus:ring-[var(--dark-accent)]",
  outline:
    "bg-transparent border border-[var(--dark-border)] text-[var(--dark-text)] hover:border-[var(--dark-accent)] hover:text-[var(--dark-accent)] focus:ring-[var(--dark-accent)]",
  ghost:
    "bg-transparent text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] hover:bg-[var(--dark-elevated)] focus:ring-[var(--dark-accent)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:bg-red-600 focus:ring-[var(--color-danger)] shadow-sm",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
