import { AlertTriangleIcon, CalendarIcon, ClockIcon, Loader2Icon, UserIcon, PlusIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useScheduledSessions } from "../hooks/useSchedule";
import { Link } from "react-router";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function SchedulePage() {
  const { data, isLoading } = useScheduledSessions();
  const sessions = data?.sessions || [];

  const getJoinState = (session) => {
    if (session.status === "expired") return "expired";
    if (!session.scheduledAt) return "joinable";

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const msUntilStart = scheduledTime - now;

    if (msUntilStart <= 2 * 60 * 1000) return "joinable";
    return "waiting";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)]">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[var(--dark-elevated)] border border-[var(--dark-border)] flex items-center justify-center shadow-lg">
              <CalendarIcon className="size-6 text-[var(--dark-accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--dark-text)]">Scheduled Interviews</h1>
              <p className="text-[var(--dark-text-secondary)] text-sm mt-1">Your upcoming interview sessions</p>
            </div>
          </div>
          <Link to="/dashboard" className="btn-green gap-2">
            <PlusIcon className="size-4" />
            Schedule
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--dark-elevated)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="size-20 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CalendarIcon className="size-10 text-[var(--dark-text-tertiary)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--dark-text)] mb-2">No Scheduled Interviews</h2>
            <p className="text-[var(--dark-text-secondary)] max-w-sm mb-6">
              You don't have any upcoming interviews. Schedule your first practice session now.
            </p>
            <Link to="/dashboard" className="btn-green px-8">
              Go to Dashboard
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="pl-2"
          >
            {sessions.map((session, index) => {
              const joinState = getJoinState(session);
              const isExpired = joinState === "expired";

              return (
                <motion.div variants={itemVariants} key={session._id} className="flex gap-4 pb-6 relative">
                  {/* Left: Time Column */}
                  <div className="w-24 text-right shrink-0 pt-1">
                    <span className={`font-mono text-sm ${isExpired ? "text-[var(--dark-text-tertiary)]" : "text-[var(--dark-accent)]"}`}>
                      {session.scheduledAt ? format(new Date(session.scheduledAt), "HH:mm") : "TBD"}
                    </span>
                    <div className="text-xs text-[var(--dark-text-secondary)] mt-0.5">
                      {session.scheduledAt ? format(new Date(session.scheduledAt), "MMM d") : ""}
                    </div>
                  </div>

                  {/* Center: Timeline Line & Dot */}
                  <div className="flex flex-col items-center relative">
                     <div className={`w-2 h-2 rounded-full z-10 mt-2 shadow-[0_0_8px_var(--dark-accent-glow)] ${isExpired ? "bg-[var(--dark-text-tertiary)]" : "bg-[var(--dark-accent)]"}`} />
                    {index !== sessions.length - 1 && (
                      <div className="w-px bg-[var(--dark-border)] absolute top-4 bottom-[-24px]" />
                    )}
                  </div>

                  {/* Right: Content Card */}
                  <div className={`card-dark-hover p-4 flex-1 ${isExpired ? "opacity-50" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--dark-text)] text-lg">{session.problem}</h3>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            session.difficulty === "easy" ? "border-[var(--color-success-border)] text-[var(--color-success)] bg-[var(--color-success-bg)]" :
                            session.difficulty === "medium" ? "border-[var(--color-warning-border)] text-[var(--color-warning)] bg-[var(--color-warning-bg)]" :
                            "border-[var(--color-danger-border)] text-[var(--color-danger)] bg-[var(--color-danger-bg)]"
                          }`}>
                            {session.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-[var(--dark-text-secondary)] mt-2">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="size-4" />
                            <span>{session.totalDuration / 60}m</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="size-4" />
                            <span>{session.host?.name || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 mt-2 sm:mt-0">
                        {isExpired ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--dark-text-tertiary)] uppercase px-3 py-1.5 bg-[var(--dark-card)] rounded border border-[var(--dark-border)]">
                            <AlertTriangleIcon className="size-3.5" />
                            Expired
                          </div>
                        ) : joinState === "waiting" ? (
                          <div className="flex items-center gap-2 text-sm text-[var(--dark-text-secondary)] bg-[var(--dark-card)] px-4 py-1.5 rounded-lg border border-[var(--dark-border)]">
                            <ClockIcon className="size-4" />
                            WAITING
                          </div>
                        ) : (
                          <Link to={`/session/${session._id}`} className="btn-green text-sm py-1.5 px-6">
                            Join Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default SchedulePage;
