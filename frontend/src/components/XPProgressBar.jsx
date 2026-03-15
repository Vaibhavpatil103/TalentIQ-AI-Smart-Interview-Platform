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
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{levelEmoji}</span>
            <div>
              <p className="font-bold text-sm">
                Level {level} · {levelTitle}
              </p>
              {level < 10 ? (
                <p className="text-xs text-base-content/50">
                  {xpToNext} XP to {nextLevelTitle}
                </p>
              ) : (
                <p className="text-xs text-success">MAX LEVEL — Legend 👑</p>
              )}
            </div>
          </div>
          <span className="badge badge-primary badge-sm font-mono">
            {xp} XP
          </span>
        </div>
        {level < 10 && (
          <progress
            className="progress progress-primary w-full h-2"
            value={progressPct}
            max={100}
          />
        )}
      </div>
    </div>
  );
}

export default XPProgressBar;
