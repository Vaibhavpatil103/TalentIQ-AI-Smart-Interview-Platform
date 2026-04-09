/**
 * EmptyState — Shared empty/zero-state component for TalentIQ
 *
 * Usage:
 *   <EmptyState
 *     icon={InboxIcon}
 *     title="No messages yet"
 *     subtitle="Start a conversation to see messages here"
 *     action="Send Message"
 *     onAction={() => …}
 *   />
 */

import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl p-16 text-center border-2 border-dashed border-[var(--dark-border)] bg-[var(--dark-card)] ${className}`}
    >
      {Icon && (
        <Icon className="size-12 mx-auto mb-4 text-[var(--dark-border)]" />
      )}
      <p className="font-semibold text-[var(--dark-text)]">{title}</p>
      {subtitle && (
        <p className="text-sm mt-2 text-[var(--dark-text-secondary)]">
          {subtitle}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {action}
          </Button>
        </div>
      )}
    </div>
  );
}
