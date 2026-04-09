/**
 * Skeleton — Loading placeholder for TalentIQ
 *
 * Usage:
 *   <Skeleton className="h-6 w-48" />         — rectangular bar
 *   <Skeleton circle className="size-12" />    — avatar circle
 *   <Skeleton className="h-4 w-full" count={3} gap="gap-2" /> — multiple lines
 */

export default function Skeleton({
  className = "",
  circle = false,
  count = 1,
  gap = "gap-2",
}) {
  const base = `bg-[var(--dark-elevated)] animate-pulse ${circle ? "rounded-full" : "rounded-md"} ${className}`;

  if (count > 1) {
    return (
      <div className={`flex flex-col ${gap}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={base} />
        ))}
      </div>
    );
  }

  return <div className={base} />;
}

/**
 * SkeletonCard — Prebuilt card-shaped skeleton
 */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3 ${className}`}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" count={2} />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}
