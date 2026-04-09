/**
 * Input & Textarea — Shared form primitives for TalentIQ
 *
 * Usage:
 *   <Input label="Email" placeholder="you@example.com" error="Required" />
 *   <Input icon={SearchIcon} placeholder="Search…" />
 *   <Textarea label="Notes" rows={4} />
 */

import { forwardRef } from "react";

const inputBase =
  "w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--dark-text-tertiary)] focus:border-[var(--dark-accent)] focus:ring-2 focus:ring-[var(--dark-accent-bg)] disabled:opacity-50 disabled:cursor-not-allowed";

const labelCls =
  "block text-xs font-semibold text-[var(--dark-text-secondary)] uppercase tracking-wider mb-1.5";

const errorCls = "text-xs text-[var(--color-danger)] mt-1";

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className={labelCls}>{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--dark-text-tertiary)] pointer-events-none" />
        )}
        <input
          ref={ref}
          className={`${inputBase} ${Icon ? "pl-9" : ""} ${error ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-bg)]" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
});

export default Input;

export const Textarea = forwardRef(function Textarea(
  { label, error, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className={labelCls}>{label}</label>}
      <textarea
        ref={ref}
        className={`${inputBase} resize-none ${error ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-bg)]" : ""} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
});
