function BadgeGrid({ earnedBadges, allBadges }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {allBadges.map((badge) => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <div key={badge.id} className="tooltip tooltip-bottom" data-tip={badge.desc}>
            <div
              className={`bg-[var(--light-card)] border border-[var(--light-border)] rounded-xl p-4 text-center cursor-default h-full transition-all duration-300 hover:border-[var(--light-accent)] hover:shadow-[var(--shadow-md)] ${
                earned
                  ? "border-[var(--light-accent)] bg-[var(--light-accent-soft)] shadow-[var(--shadow-sm)]"
                  : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
              }`}
            >
              <div className="text-2xl drop-shadow-md mb-2 flex items-center justify-center h-8">
                {earned ? badge.emoji : "🔒"}
              </div>
              <p className="text-xs font-semibold text-[var(--light-text)] leading-tight">
                {badge.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BadgeGrid;
