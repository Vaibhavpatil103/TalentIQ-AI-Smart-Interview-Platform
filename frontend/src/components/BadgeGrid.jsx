function BadgeGrid({ earnedBadges, allBadges }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {allBadges.map((badge) => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <div key={badge.id} className="tooltip" data-tip={badge.desc}>
            <div
              className={`card border text-center cursor-default transition-all ${
                earned
                  ? "bg-base-100 border-primary/30 shadow-sm"
                  : "bg-base-200 border-base-300 opacity-40 grayscale"
              }`}
            >
              <div className="card-body py-3 px-2">
                <div className="text-2xl mb-1">
                  {earned ? badge.emoji : "🔒"}
                </div>
                <p className="text-xs font-semibold leading-tight">
                  {badge.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BadgeGrid;
