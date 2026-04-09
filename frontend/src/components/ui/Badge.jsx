/**
 * Badge — Semantic status/label badges for TalentIQ
 *
 * Variants: success | warning | danger | info | purple | neutral
 *
 * Usage:
 *   <Badge variant="success">Easy</Badge>
 *   <Badge variant="danger" dot>Critical</Badge>
 *   <Badge variant="info" icon={SparklesIcon}>AI</Badge>
 */

const variants = {
  success:
    "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]",
  info:
    "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
  purple:
    "bg-[var(--color-purple-bg)] text-[var(--color-purple)] border-[var(--color-purple-border)]",
  neutral:
    "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)]",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-[11px] px-2 py-0.5",
  lg: "text-xs px-2.5 py-1",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  icon: Icon,
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-full leading-tight ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  );
}

/**
 * Difficulty badge helper — maps difficulty strings to Badge variants
 */
export function DifficultyBadge({ difficulty, ...props }) {
  const map = {
    easy: "success",
    Easy: "success",
    medium: "warning",
    Medium: "warning",
    hard: "danger",
    Hard: "danger",
  };
  return (
    <Badge variant={map[difficulty] || "neutral"} {...props}>
      {difficulty}
    </Badge>
  );
}
