import { Loader2Icon } from "lucide-react";

function CompanyTrackCard({
  company,
  emoji,
  topics,
  completedTopics,
  started,
  onStart,
  isLoading,
}) {
  const readinessPct = Math.round(
    (completedTopics.length / topics.length) * 100
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md hover:shadow-lg transition-all">
      <div className="card-body">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h3 className="font-bold text-lg">{company}</h3>
          </div>
          <div
            className="radial-progress text-primary text-xs"
            style={{
              "--value": readinessPct,
              "--size": "3rem",
              "--thickness": "4px",
            }}
          >
            {readinessPct}%
          </div>
        </div>
        <div className="space-y-1 mb-4">
          {topics.map((topic) => (
            <div key={topic} className="flex items-center gap-2 text-sm">
              <span
                className={
                  completedTopics.includes(topic)
                    ? "text-success"
                    : "text-base-content/30"
                }
              >
                {completedTopics.includes(topic) ? "✓" : "○"}
              </span>
              <span
                className={
                  completedTopics.includes(topic)
                    ? "line-through text-base-content/50"
                    : ""
                }
              >
                {topic}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-base-content/50 mb-3">
          {completedTopics.length} / {topics.length} topics completed
        </p>
        {!started ? (
          <button
            className="btn btn-outline btn-sm w-full"
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Start Track"
            )}
          </button>
        ) : (
          <button className="btn btn-primary btn-sm w-full" onClick={onStart}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

export default CompanyTrackCard;
