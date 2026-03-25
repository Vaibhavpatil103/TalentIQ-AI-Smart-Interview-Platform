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
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow-md">{levelEmoji}</span>
          <div>
            <p className="font-bold text-[#e6edf3]">
              Level {level} <span className="text-[#30363d] mx-1">|</span> {levelTitle}
            </p>
            {level < 10 ? (
              <p className="text-xs text-[#7d8590] font-medium tracking-wide">
                {xpToNext} XP to {nextLevelTitle}
              </p>
            ) : (
              <p className="text-xs text-[#2cbe4e] font-bold tracking-widest uppercase">MAX LEVEL — Legend 👑</p>
            )}
          </div>
        </div>
        <div className="bg-[#1c2128] border border-[#30363d] px-3 py-1.5 rounded-lg shrink-0">
          <span className="font-mono text-[#2cbe4e] font-bold">
            {xp} <span className="text-[10px] text-[#7d8590] uppercase ml-0.5">XP</span>
          </span>
        </div>
      </div>
      {level < 10 && (
        <div className="h-2 w-full bg-[#1c2128] rounded-full overflow-hidden border border-[#30363d]/50">
          <div
            className="h-full bg-[#2cbe4e] rounded-full shadow-[0_0_8px_rgba(44,190,78,0.5)] transition-all duration-800 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default XPProgressBar;
