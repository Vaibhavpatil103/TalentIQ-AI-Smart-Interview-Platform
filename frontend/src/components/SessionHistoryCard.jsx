import { ClockIcon, MessageSquareIcon } from "lucide-react";

function SessionHistoryCard({ session, onClick }) {
  const modeBadge =
    session.mode === "topic" ? (
      <span className="badge badge-info badge-sm">Topic</span>
    ) : (
      <span className="badge badge-secondary badge-sm">Resume</span>
    );

  const difficultyColor = {
    Easy: "badge-success",
    Medium: "badge-warning",
    Hard: "badge-error",
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  const overallScore = session.feedback?.overallScore ?? "—";
  const scoreColor =
    overallScore >= 7
      ? "text-success"
      : overallScore >= 4
      ? "text-warning"
      : "text-error";

  return (
    <div
      className="card bg-base-100 shadow-md border border-base-300 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="card-body p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {modeBadge}
            {session.difficulty && (
              <span
                className={`badge badge-sm ${
                  difficultyColor[session.difficulty] || ""
                }`}
              >
                {session.difficulty}
              </span>
            )}
          </div>
          <span className="badge badge-success badge-sm badge-outline">
            Completed
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
          {session.mode === "topic"
            ? session.topic || "Topic Interview"
            : "Resume Interview"}
        </h3>

        {/* Score + Meta */}
        <div className="flex items-center justify-between mt-3">
          <div className={`text-3xl font-black ${scoreColor}`}>
            {overallScore}
            <span className="text-sm font-normal text-base-content/50">
              /10
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-base-content/60">
            <div className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {formatDuration(session.totalDuration)}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquareIcon className="size-3" />
              {session.questionCount || 0} questions
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-base-content/40 mt-2">
          {formatDate(session.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default SessionHistoryCard;
