/**
 * CompanyUI — Shared UI components for company-side pages
 * Uses TalentIQ design tokens (--tiq-* CSS variables)
 * 
 * Exports:
 *   PageHeader, StatCard, MiniStat, ModalShell,
 *   FilterPills, EmptyState, SectionLabel
 */

import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ChevronRightIcon } from "lucide-react";

/* ─── Color constants (matching CSS vars for inline styles) ──── */
const T = {
  primary:       "#0a66c2",
  primaryHover:  "#004182",
  primaryLight:  "#e8f0fe",
  primaryRing:   "rgba(10, 102, 194, 0.15)",
  primaryBorder: "#8bb9fe",
  gradient:      "linear-gradient(135deg, #0a66c2 0%, #1e40af 100%)",
  bgPage:        "#f8fafc",
  bgCard:        "#ffffff",
  border:        "#e2e8f0",
  borderLight:   "#f1f5f9",
  textPrimary:   "#0f172a",
  textBody:      "#334155",
  textMuted:     "#64748b",
  textDim:       "#94a3b8",
  shadowSm:      "0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:      "0 4px 12px rgba(0,0,0,0.06)",
};

export { T };

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER — gradient hero with decorative shapes
   ═══════════════════════════════════════════════════════════════ */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div
      className="relative overflow-hidden py-10 px-6"
      style={{ background: T.gradient }}
    >
      {/* Decorative blobs */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-24 -bottom-20 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute -left-8 top-4 w-32 h-32 rounded-full bg-white/[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-start justify-between relative z-10 gap-6">
        <div>
          {eyebrow && (
            <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/60 text-sm mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER BUTTON — CTA button for inside PageHeader
   ═══════════════════════════════════════════════════════════════ */
export function HeaderButton({ onClick, icon: Icon, children, variant = "solid" }) {
  const base = "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200";
  const variants = {
    solid: `${base} bg-white text-[${T.primary}] hover:bg-blue-50 shadow-lg shadow-black/10`,
    ghost: `${base} text-white border border-white/25 hover:bg-white/15 backdrop-blur-sm`,
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={variants[variant]}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD — larger stat card for dashboard
   ═══════════════════════════════════════════════════════════════ */
export function StatCard({ icon: Icon, label, value, sub, trend, accentColor }) {
  const color = accentColor || T.primary;
  return (
    <motion.div
      className="bg-white rounded-2xl p-5 relative overflow-hidden group"
      style={{
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
      }}
      whileHover={{
        y: -2,
        boxShadow: T.shadowMd,
        borderColor: T.primaryBorder,
      }}
      transition={{ duration: 0.2 }}
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: `${color}12`, color }}
          >
            <Icon className="size-5" />
          </div>
          <p className="text-3xl font-bold tracking-tight" style={{ color: T.textPrimary }}>
            {value}
          </p>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>
            {label}
          </p>
        </div>
        {trend && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "#dcfce7",
              color: "#16a34a",
            }}
          >
            {trend}
          </span>
        )}
      </div>
      {sub && (
        <p
          className="text-xs mt-3 pt-3"
          style={{ color: T.textDim, borderTop: `1px solid ${T.borderLight}` }}
        >
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MINI STAT — compact stat card
   ═══════════════════════════════════════════════════════════════ */
export function MiniStat({ icon: Icon, label, value, sub, accentColor, pulse }) {
  const color = accentColor || T.primary;
  return (
    <div
      className="bg-white rounded-xl p-4 flex-1 relative overflow-hidden"
      style={{
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}12`, color }}
        >
          <Icon className="size-4" />
        </div>
        {pulse && (
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: T.textPrimary }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: T.textMuted }}>
        {label}
      </p>
      {sub && (
        <p className="text-[10px] mt-0.5" style={{ color: T.textDim }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION LABEL
   ═══════════════════════════════════════════════════════════════ */
export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-0">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: T.primary }}
      />
      <h2
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: T.textMuted }}
      >
        {children}
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL SHELL
   ═══════════════════════════════════════════════════════════════ */
export function ModalShell({ title, onClose, children, footer, maxWidth = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`bg-white rounded-2xl w-full ${maxWidth} mx-4 z-10 flex flex-col max-h-[90vh] overflow-hidden`}
        style={{
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowXl || "0 20px 50px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <h3 className="font-bold text-lg" style={{ color: T.textPrimary }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
            style={{ color: T.textMuted }}
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">{children}</div>
        <div
          className="px-6 py-4 flex gap-3 justify-end flex-shrink-0"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          {footer}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILTER PILLS
   ═══════════════════════════════════════════════════════════════ */
export function FilterPills({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => {
        const label = typeof f === "string" ? f : f.label;
        const value = typeof f === "string" ? f : f.value;
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-label={`Filter by ${label}`}
            aria-pressed={isActive}
            className="px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200"
            style={{
              backgroundColor: isActive ? T.primary : T.bgCard,
              color: isActive ? "#ffffff" : T.textMuted,
              border: `1px solid ${isActive ? T.primary : T.border}`,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div
      className="rounded-2xl p-16 text-center"
      style={{
        border: `2px dashed ${T.border}`,
        backgroundColor: T.bgCard,
      }}
    >
      {Icon && (
        <Icon className="size-12 mx-auto mb-4" style={{ color: T.border }} />
      )}
      <p className="font-semibold" style={{ color: T.textPrimary }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-sm mt-2" style={{ color: T.textMuted }}>
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={onAction}
          className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: T.primary,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK ACTION ROW
   ═══════════════════════════════════════════════════════════════ */
export function QuickAction({ icon: Icon, accentColor, title, sub, onClick }) {
  const color = accentColor || T.primary;
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl w-full text-left mb-2 last:mb-0 transition-all duration-200"
      style={{
        border: `1px solid ${T.border}`,
        backgroundColor: T.bgCard,
      }}
      whileHover={{
        x: 2,
        borderColor: T.primaryBorder,
        boxShadow: T.shadowSm,
      }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12`, color }}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium" style={{ color: T.textPrimary }}>
          {title}
        </h4>
        <p className="text-xs" style={{ color: T.textMuted }}>
          {sub}
        </p>
      </div>
      <ChevronRightIcon className="size-4 flex-shrink-0" style={{ color: T.border }} />
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
export const inputCls = "input-light w-full transition-all duration-200";

export const labelCls = "block text-xs font-semibold text-[var(--light-text-secondary)] uppercase tracking-wider mb-1.5";

/* ── Button primitives ───────────────────────────────────────── */
export const btnPrimary = `flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white
  rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200
  hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50`;

export const btnSecondary = `px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm
  text-[#64748b] hover:bg-[#f8fafc] hover:border-[#0a66c2] transition-all duration-200`;

export const btnGhost = `text-[#0a66c2] text-sm font-medium hover:underline
  disabled:opacity-50 transition-colors`;
