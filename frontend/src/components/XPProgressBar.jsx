function XPProgressBar({ xp, level, levelTitle, nextLevelTitle, xpToNext, xpForCurrentLevel }) {
  const levelEmoji = level <= 3 ? "🌱" : level <= 6 ? "⚡" : level <= 9 ? "🔥" : "👑";
  const progressPct =
    xpToNext > 0
      ? Math.min(
          100,
          Math.round(
            ((xp - xpForCurrentLevel) / (xp - xpForCurrentLevel + xpToNext)) *
              100
          )
        )
      : 100;

  return (
    <div className="bg-[var(--light-card)] border border-[var(--light-border)] rounded-xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow-md">{levelEmoji}</span>
          <div>
            <p className="font-bold text-[var(--light-text)]">
              Level {level} <span className="text-[var(--light-border)] mx-1">|</span> {levelTitle}
            </p>
            {level < 10 ? (
              <p className="text-xs text-[var(--light-text-secondary)] font-medium tracking-wide">
                {xpToNext} XP to {nextLevelTitle}
              </p>
            ) : (
              <p className="text-xs text-[var(--light-accent)] font-bold tracking-widest uppercase">MAX LEVEL — Legend 👑</p>
            )}
          </div>
        </div>
        <div className="bg-[var(--light-elevated)] border border-[var(--light-border)] px-3 py-1.5 rounded-lg shrink-0">
          <span className="font-mono text-[var(--light-accent)] font-bold">
            {xp} <span className="text-[10px] text-[var(--light-text-secondary)] uppercase ml-0.5">XP</span>
          </span>
        </div>
      </div>
      {level < 10 && (
        <div className="h-2 w-full bg-[var(--light-elevated)] rounded-full overflow-hidden border border-[var(--light-border-subtle)]">
          <div
            className="h-full bg-[var(--light-accent)] rounded-full shadow-[0_0_8px_var(--light-accent-ring)] transition-all duration-800 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default XPProgressBar;
