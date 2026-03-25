function BadgeGrid({ earnedBadges, allBadges }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {allBadges.map((badge) => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <div key={badge.id} className="tooltip tooltip-bottom" data-tip={badge.desc}>
            <div
              className={`card-dark-hover p-4 text-center cursor-default h-full transition-all duration-300 ${
                earned
                  ? "border-[#2cbe4e40] bg-[#2cbe4e05]"
                  : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
              }`}
            >
              <div className="text-2xl drop-shadow-md mb-2 flex items-center justify-center h-8">
                {earned ? badge.emoji : "🔒"}
              </div>
              <p className="text-xs font-semibold text-[#e6edf3] leading-tight">
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
