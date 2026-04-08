import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarIcon,
  VideoIcon,
  CheckCircleIcon,
  PlusIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import CompanyNavbar from "../../components/CompanyNavbar";
import { useActiveSessions } from "../../hooks/useSessions";
import { useScheduledSessions } from "../../hooks/useSchedule";
import { useMyRecentSessions } from "../../hooks/useSessions";
import CreateSessionModal from "../../components/CreateSessionModal";
import { formatDistanceToNow } from "date-fns";
import {
  PageHeader,
  HeaderButton,
  MiniStat,
  EmptyState,
  T,
} from "../../components/ui/CompanyUI";

// ── Tab pill ──────────────────────────────────────────────────
const TABS = ["Active", "Scheduled", "Completed"];

function TabBar({ active, onChange }) {
  return (
    <div className="inline-flex p-1 rounded-xl gap-1 mb-6" style={{ backgroundColor: T.bgPage }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={{
            backgroundColor: active === tab ? T.bgCard : "transparent",
            color: active === tab ? T.textPrimary : T.textMuted,
            boxShadow: active === tab ? T.shadowSm : "none",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────
function SessionCard({ session, tab }) {
  const navigate = useNavigate();

  const difficultyColor = {
    Easy:   "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
    Medium: "bg-[#fef9c3] text-[#ca8a04] border-[#facc15]",
    Hard:   "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]",
  }[session.difficulty] || "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]";

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.1 }}
      className="rounded-2xl p-5 mb-3 transition-all duration-200"
      style={{
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: T.textPrimary }}>
            {session.problem || "No problem selected"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {session.difficulty && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${difficultyColor}`}>
                {session.difficulty}
              </span>
            )}
            <span className="text-xs font-mono" style={{ color: T.textDim }}>
              #{session._id?.slice(-6)}
            </span>
          </div>
          {session.participant && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: T.bgPage, border: `1px solid ${T.border}`, color: T.textMuted }}>
                {(session.participant?.name || "?")[0].toUpperCase()}
              </div>
              <span className="text-xs" style={{ color: T.textMuted }}>{session.participant?.name}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {tab === "Active" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: T.primary }} />
                <span className="text-xs font-semibold" style={{ color: T.primary }}>Live</span>
              </div>
              <button
                onClick={() => navigate(`/session/${session._id}`)}
                className="text-white text-xs px-4 py-1.5 rounded-lg transition-all duration-200 font-medium"
                style={{ backgroundColor: T.primary }}>
                Join
              </button>
            </>
          )}
          {tab === "Scheduled" && (
            <>
              <div className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                <CalendarIcon className="size-3" />
                {session.scheduledAt
                  ? formatDistanceToNow(new Date(session.scheduledAt), { addSuffix: true })
                  : "Unscheduled"}
              </div>
              <button className="text-xs px-4 py-1.5 rounded-lg transition-all duration-200"
                style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
                View
              </button>
            </>
          )}
          {tab === "Completed" && (
            <>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}>
                <CheckCircleIcon className="size-3" />
                Completed
              </div>
              <button
                onClick={() => navigate(`/feedback/${session._id}`)}
                className="text-xs font-medium hover:underline" style={{ color: T.primary }}>
                Feedback →
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────
function CompanyInterviewsPage() {
  const [tab, setTab] = useState("Active");
  const [showCreate, setShowCreate] = useState(false);

  const { data: activeData }    = useActiveSessions();
  const { data: schedData }     = useScheduledSessions();
  const { data: recentData }    = useMyRecentSessions();

  const activeSessions    = activeData?.sessions ?? [];
  const scheduledSessions = schedData?.sessions ?? [];
  const recentSessions    = recentData?.sessions ?? [];

  const sessions =
    tab === "Active"    ? activeSessions :
    tab === "Scheduled" ? scheduledSessions :
    recentSessions;

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.bgPage }}>
      <CompanyNavbar />

      <PageHeader
        eyebrow="Interview Management"
        title="Interviews"
        subtitle={`${activeSessions.length} live · ${scheduledSessions.length} scheduled · ${recentSessions.length} completed`}
      >
        <HeaderButton onClick={() => setShowCreate(true)} icon={PlusIcon}>
          Create Interview
        </HeaderButton>
      </PageHeader>

      {/* ── STAT CARDS ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={VideoIcon} accentColor={T.primary} label="Live Sessions" value={activeSessions.length} sub="In progress now" pulse />
          <MiniStat icon={CalendarIcon} accentColor="#7c3aed" label="Scheduled" value={scheduledSessions.length} sub="Upcoming interviews" />
          <MiniStat icon={CheckCircleIcon} accentColor="#16a34a" label="Completed" value={recentSessions.length} sub="Past sessions" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-6 py-2 pb-16">
        <TabBar active={tab} onChange={setTab} />

        {sessions.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title={`No ${tab.toLowerCase()} sessions`}
            subtitle={
              tab === "Active" ? "Create an interview to get started"
              : tab === "Scheduled" ? "Schedule interviews to see them here"
              : "Completed interviews will appear here"
            }
            action={tab === "Active" ? "Create Interview" : undefined}
            onAction={tab === "Active" ? () => setShowCreate(true) : undefined}
          />
        ) : (
          sessions.map((session) => (
            <SessionCard key={session._id} session={session} tab={tab} />
          ))
        )}
      </motion.div>

      <CreateSessionModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

export default CompanyInterviewsPage;
