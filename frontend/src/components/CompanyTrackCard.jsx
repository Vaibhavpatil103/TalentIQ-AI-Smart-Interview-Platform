import { CheckCircle2Icon, Loader2Icon, PlayIcon } from "lucide-react";

function CompanyTrackCard({
  company,
  emoji,
  color,
  topics,
  completedTopics,
  started,
  onStart,
  isLoading,
}) {
  const progressPct = started
    ? Math.round((completedTopics.length / topics.length) * 100)
    : 0;

  const colorMap = {
    green: "text-[#2cbe4e] bg-[#2cbe4e10] border-[#2cbe4e40] progress-success",
    orange: "text-[#d29922] bg-[#d2992210] border-[#d2992240] progress-warning",
    blue: "text-[#58a6ff] bg-[#58a6ff10] border-[#58a6ff40] progress-info",
    purple: "text-[#a371f7] bg-[#a371f710] border-[#a371f740] progress-secondary",
    red: "text-[#f85149] bg-[#f8514910] border-[#f8514940] progress-error",
  };
  
  const theme = colorMap[color] || "text-[#2cbe4e] bg-[#2cbe4e10] border-[#2cbe4e40] progress-success";
  const bgClass = theme.split(" ")[1];
  const textClass = theme.split(" ")[0];
  const borderClass = theme.split(" ")[2];
  const progressClass = theme.split(" ")[3];

  return (
    <div className="card-dark p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`size-12 rounded-xl flex items-center justify-center text-2xl border ${bgClass} ${borderClass}`}>
            {emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#e6edf3]">{company}</h3>
            <p className="text-sm text-[#7d8590] mt-0.5">
              {topics.length} topics
            </p>
          </div>
        </div>
        {started && progressPct === 100 && (
          <CheckCircle2Icon className="size-6 text-[#2cbe4e]" />
        )}
      </div>

      <div className="mb-6 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">
            Progress
          </span>
          <span className={`text-xs font-bold ${started ? textClass : "text-[#484f58]"}`}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 w-full bg-[#1c2128] rounded-full overflow-hidden border border-[#30363d]/50">
          <progress
            className={`progress w-full h-full bg-transparent ${progressClass}`}
            value={progressPct}
            max="100"
          ></progress>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map((topic) => {
          const isCompleted = started && completedTopics.includes(topic);
          return (
            <span
              key={topic}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                isCompleted
                  ? "text-[#2cbe4e] border-[#2cbe4e40] bg-[#2cbe4e10]"
                  : "border-[#30363d] bg-[#1c2128] text-[#7d8590]"
              }`}
            >
              {topic}
            </span>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-[#30363d]">
        {started ? (
          <button className="btn-outline-dark w-full gap-2 py-2.5 hover:bg-[#1c2128] hover:text-[#e6edf3]">
            <PlayIcon className="size-4" />
            Continue Track
          </button>
        ) : (
          <button
            className="btn-green w-full gap-2 py-2.5 shadow-lg shadow-[#2cbe4e]/10"
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlayIcon className="size-4" />
            )}
            Start Preparation
          </button>
        )}
      </div>
    </div>
  );
}

export default CompanyTrackCard;
