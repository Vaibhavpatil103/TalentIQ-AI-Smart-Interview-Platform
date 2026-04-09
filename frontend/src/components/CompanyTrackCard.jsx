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
    green: "text-[var(--dark-accent)] bg-[var(--dark-accent-bg)] border-[var(--dark-accent-border)] progress-success",
    orange: "text-[var(--color-warning)] bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] progress-warning",
    blue: "text-[var(--color-info)] bg-[var(--color-info-bg)] border-[var(--color-info-border)] progress-info",
    purple: "text-[var(--color-purple)] bg-[var(--color-purple-bg)] border-[var(--color-purple-border)] progress-secondary",
    red: "text-[var(--color-danger)] bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] progress-error",
  };
  
  const theme = colorMap[color] || "text-[var(--dark-accent)] bg-[var(--dark-accent-bg)] border-[var(--dark-accent-border)] progress-success";
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
            <h3 className="text-xl font-bold text-[var(--dark-text)]">{company}</h3>
            <p className="text-sm text-[var(--dark-text-secondary)] mt-0.5">
              {topics.length} topics
            </p>
          </div>
        </div>
        {started && progressPct === 100 && (
          <CheckCircle2Icon className="size-6 text-[var(--dark-accent)]" />
        )}
      </div>

      <div className="mb-6 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--dark-text-secondary)] uppercase tracking-wider">
            Progress
          </span>
          <span className={`text-xs font-bold ${started ? textClass : "text-[var(--dark-text-tertiary)]"}`}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 w-full bg-[var(--dark-elevated)] rounded-full overflow-hidden border border-[var(--dark-border)]/50">
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
                  ? "text-[var(--dark-accent)] border-[var(--dark-accent-border)] bg-[var(--dark-accent-bg)]"
                  : "border-[var(--dark-border)] bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)]"
              }`}
            >
              {topic}
            </span>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--dark-border)]">
        {started ? (
          <button className="btn-outline-dark w-full gap-2 py-2.5 hover:bg-[var(--dark-elevated)] hover:text-[var(--dark-text)]">
            <PlayIcon className="size-4" />
            Continue Track
          </button>
        ) : (
          <button
            className="btn-green w-full gap-2 py-2.5 shadow-lg shadow-[var(--dark-accent)]/10"
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
