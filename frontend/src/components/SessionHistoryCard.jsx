import { ClockIcon, MessageSquareIcon } from "lucide-react";
import { motion } from "framer-motion";

function SessionHistoryCard({ session, onClick }) {
  const modeBadge =
    session.mode === "topic" ? (
      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-[#58a6ff40] text-[#58a6ff] bg-[#58a6ff10]">Topic</span>
    ) : (
      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-[#a371f740] text-[#a371f7] bg-[#a371f710]">Resume</span>
    );

  const difficultyColor = {
    Easy: "border-[#ffffff40] text-[#ffffff] bg-[#ffffff10]",
    Medium: "border-[#d2992240] text-[#d29922] bg-[#d2992210]",
    Hard: "border-[#f8514940] text-[#f85149] bg-[#f8514910]",
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
    return `${mins}m`;
  };

  const overallScore = session.feedback?.overallScore ?? "—";
  const scoreColor =
    overallScore >= 7
      ? "text-[#ffffff]"
      : overallScore >= 4
      ? "text-[#d29922]"
      : "text-[#f85149]";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-dark-hover p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-[#e6edf3] text-lg">
            {session.mode === "topic"
              ? session.topic || "Topic Interview"
              : "Resume Interview"}
          </h3>
          <div className="flex items-center gap-2">
            {modeBadge}
            {session.difficulty && (
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                  difficultyColor[session.difficulty] || ""
                }`}
              >
                {session.difficulty}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-sm text-[#7d8590]">
            <ClockIcon className="size-4" />
            <span>{formatDuration(session.totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#7d8590]">
            <MessageSquareIcon className="size-4" />
            <span>{session.questionCount || 0} questions</span>
          </div>
          <div className="text-sm text-[var(--dark-text-tertiary)] ml-2">
            {formatDate(session.createdAt)}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end">
        <div className={`font-mono text-3xl font-black ${scoreColor}`}>
          {overallScore}
          <span className="text-sm font-bold text-[#7d8590] ml-1">/10</span>
        </div>
      </div>
    </motion.div>
  );
}

export default SessionHistoryCard;
