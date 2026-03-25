import { ClockIcon, InboxIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

function RecentSessions({ sessions, isLoading }) {
  const getBadgeClass = (diff) => {
    if (!diff) return "badge-easy";
    const d = diff.toLowerCase();
    if (d === "hard") return "badge-hard";
    if (d === "medium") return "badge-medium";
    return "badge-easy";
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="size-4 text-[#7d8590]" />
        <h2 className="text-xs uppercase tracking-wider text-[#7d8590] font-semibold">
          Your Past Sessions
        </h2>
      </div>

      <div className="w-full">
        {/* Header Row */}
        <div className="grid grid-cols-4 md:grid-cols-[2fr_1fr_1fr_1fr] text-xs uppercase tracking-wider text-[#484f58] border-b border-[#30363d] pb-3 mb-2 px-4">
          <div>Problem</div>
          <div>Difficulty</div>
          <div>Date</div>
          <div className="text-right">Status</div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-line h-12 w-full" />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
            {sessions.map((session) => (
              <motion.div
                variants={item}
                key={session._id}
                className="grid grid-cols-4 md:grid-cols-[2fr_1fr_1fr_1fr] items-center hover:bg-[#161b22] transition-colors py-4 px-4 border-b border-[#30363d] last:border-0"
              >
                <div className="font-medium text-[#e6edf3] truncate pr-4">
                  {session.problem}
                </div>
                <div>
                  <span className={`${getBadgeClass(session.difficulty)}`}>
                    {session.difficulty}
                  </span>
                </div>
                <div className="text-sm text-[#7d8590]">
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center justify-end gap-2 text-sm text-[#2cbe4e]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2cbe4e]" />
                  Completed
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <InboxIcon className="size-8 text-[#484f58] mb-3" />
            <p className="text-[#7d8590]">No sessions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentSessions;
