import {
  ArrowRightIcon,
  CrownIcon,
  ZapIcon
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="lg:col-span-2 flex flex-col h-full">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm uppercase tracking-wider text-[#7d8590] font-semibold flex items-center gap-2">
          Live Sessions
          <span className="w-2 h-2 rounded-full bg-[#2cbe4e] animate-pulse inline-block" />
        </h2>
      </div>

      <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-line h-16 w-full" />
          ))
        ) : sessions.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {sessions.map((session) => (
              <motion.div
                variants={item}
                key={session._id}
                className="card-dark-hover p-4 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1 items-start min-w-0">
                  <span className="font-semibold text-[#e6edf3] truncate max-w-full">
                    {session.problem || "No problem selected"}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-[#7d8590]">
                      <CrownIcon className="size-3.5" />
                      <span>{session.host?.name}</span>
                    </div>
                    <div className="bg-[#1c2128] text-[#7d8590] text-xs px-2 py-0.5 rounded-full">
                      {session.participant ? "2/2" : "1/2"}
                    </div>
                  </div>
                </div>

                <div className="pl-4 shrink-0">
                  {session.participant && !isUserInSession(session) ? (
                    <button disabled className="btn-outline-dark opacity-50 cursor-not-allowed text-sm py-1.5 px-3 rounded-lg font-medium">
                      Full
                    </button>
                  ) : (
                    <Link
                      to={`/session/${session._id}`}
                      className="btn-outline-dark text-sm py-1.5 px-4 rounded-lg font-medium flex items-center gap-2"
                    >
                      Rejoin <ArrowRightIcon className="size-3.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center h-full">
            <ZapIcon className="size-8 text-[#484f58] mb-3" />
            <p className="text-[#7d8590]">No active sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ActiveSessions;
