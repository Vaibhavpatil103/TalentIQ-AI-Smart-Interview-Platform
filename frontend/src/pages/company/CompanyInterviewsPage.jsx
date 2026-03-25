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

// ── Tab pill ──────────────────────────────────────────────────
const TABS = ["Active", "Scheduled", "Completed"];

function TabBar({ active, onChange }) {
  return (
    <div className="inline-flex bg-[#f6f8fa] p-1 rounded-lg gap-1 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            active === tab
              ? "bg-white text-[#1c2128] shadow-sm"
              : "text-[#57606a] hover:text-[#1c2128]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ── Mini stat card ────────────────────────────────────────────
function MiniStat({ icon: Icon, iconBg, topColor, label, value, sub, pulse }) {
  return (
    <div className="bg-white border border-[#d0d7de] rounded-xl p-4 flex-1" style={{ borderTop: `3px solid ${topColor}` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="size-4" style={{ color: topColor }} />
        </div>
        {pulse && <span className="w-2 h-2 rounded-full bg-[#0969da] animate-pulse" />}
      </div>
      <p className="text-2xl font-bold text-[#1c2128]">{value}</p>
      <p className="text-xs text-[#57606a] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-[#8c959f] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────
function SessionCard({ session, tab }) {
  const navigate = useNavigate();

  const difficultyColor = {
    Easy:   "bg-[#dafbe1] text-[#1a7f37] border-[#56d364]",
    Medium: "bg-[#fff8c5] text-[#9a6700] border-[#e3b341]",
    Hard:   "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]",
  }[session.difficulty] || "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]";

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.1 }}
      className="bg-white border border-[#d0d7de] rounded-xl p-5 mb-3
        hover:border-[#0969da] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1c2128] truncate">
            {session.problem || "No problem selected"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {session.difficulty && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${difficultyColor}`}>
                {session.difficulty}
              </span>
            )}
            <span className="text-xs text-[#8c959f] font-mono">
              #{session._id?.slice(-6)}
            </span>
          </div>
          {/* Participant */}
          {session.participant && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-[#f6f8fa] border border-[#d0d7de]
                flex items-center justify-center text-[10px] font-bold text-[#57606a]">
                {(session.participant?.name || "?")[0].toUpperCase()}
              </div>
              <span className="text-xs text-[#57606a]">{session.participant?.name}</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {tab === "Active" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0969da] animate-pulse" />
                <span className="text-xs font-semibold text-[#0969da]">Live</span>
              </div>
              <button
                onClick={() => navigate(`/session/${session._id}`)}
                className="bg-[#0969da] hover:bg-[#0550ae] text-white text-xs
                  px-4 py-1.5 rounded-lg transition-colors font-medium"
              >
                Join
              </button>
            </>
          )}

          {tab === "Scheduled" && (
            <>
              <div className="flex items-center gap-1 text-xs text-[#57606a]">
                <CalendarIcon className="size-3" />
                {session.scheduledAt
                  ? formatDistanceToNow(new Date(session.scheduledAt), { addSuffix: true })
                  : "Unscheduled"}
              </div>
              <button className="border border-[#d0d7de] hover:border-[#0969da] text-[#57606a]
                text-xs px-4 py-1.5 rounded-lg transition-colors">
                View
              </button>
            </>
          )}

          {tab === "Completed" && (
            <>
              <div className="flex items-center gap-1 text-xs text-[#1a7f37]">
                <CheckCircleIcon className="size-3" />
                Completed
              </div>
              <button
                onClick={() => navigate(`/feedback/${session._id}`)}
                className="text-[#0969da] text-xs font-medium hover:underline"
              >
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
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-8 px-6"
        style={{ background: "linear-gradient(135deg, #0969da 0%, #0550ae 100%)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

        <div className="max-w-7xl mx-auto flex items-start justify-between relative z-10 gap-6">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 font-medium">
              Interview Management
            </p>
            <h1 className="text-2xl font-bold text-white">Interviews</h1>
            <p className="text-white/70 text-sm mt-1">
              {activeSessions.length} live · {scheduledSessions.length} scheduled · {recentSessions.length} completed
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreate(true)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-white text-[#0969da] font-semibold
              rounded-lg px-4 py-2 text-sm hover:bg-[#f6f8fa] transition-colors flex-shrink-0"
          >
            <PlusIcon className="size-4" />
            Create Interview
          </motion.button>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat
            icon={VideoIcon} iconBg="#ddf4ff" topColor="#0969da"
            label="Live Sessions" value={activeSessions.length}
            sub="In progress now" pulse
          />
          <MiniStat
            icon={CalendarIcon} iconBg="#fbefff" topColor="#8250df"
            label="Scheduled" value={scheduledSessions.length}
            sub="Upcoming interviews"
          />
          <MiniStat
            icon={CheckCircleIcon} iconBg="#dafbe1" topColor="#1a7f37"
            label="Completed" value={recentSessions.length}
            sub="Past sessions"
          />
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-2 pb-16"
      >
        <TabBar active={tab} onChange={setTab} />

        {sessions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#d0d7de] rounded-xl p-16 text-center">
            <CalendarIcon className="size-12 text-[#d0d7de] mx-auto mb-4" />
            <p className="font-semibold text-[#1c2128]">
              No {tab.toLowerCase()} sessions
            </p>
            <p className="text-sm text-[#57606a] mt-2">
              {tab === "Active"
                ? "Create an interview to get started"
                : tab === "Scheduled"
                ? "Schedule interviews to see them here"
                : "Completed interviews will appear here"}
            </p>
            {tab === "Active" && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg
                  px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Create Interview
              </button>
            )}
          </div>
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
