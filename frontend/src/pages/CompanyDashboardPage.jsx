import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  UsersIcon,
  VideoIcon,
  PlusIcon,
  MapPinIcon,
  KanbanIcon,
  ChevronRightIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import CompanyNavbar from "../components/CompanyNavbar";
import { useActiveSessions } from "../hooks/useSessions";
import { useScheduledSessions } from "../hooks/useSchedule";
import CreateSessionModal from "../components/CreateSessionModal";
import { formatDistanceToNow } from "date-fns";

// ── Helpers ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ── Section label ───────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-0">
      <span className="w-2 h-2 rounded-full bg-[#0969da] animate-pulse flex-shrink-0" />
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#57606a]">
        {children}
      </h2>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, iconBg, iconColor, topColor }) {
  return (
    <motion.div
      className="bg-white border border-[#d0d7de] rounded-xl p-5 relative overflow-hidden"
      style={{ borderTop: `3px solid ${topColor}` }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.15 }}
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="size-[18px]" style={{ color: iconColor }} />
          </div>
          <p className="text-3xl font-semibold text-[#1c2128]">{value}</p>
          <p className="text-sm text-[#57606a] mt-1">{label}</p>
        </div>
        {trend && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#dafbe1] text-[#1a7f37] flex-shrink-0">
            {trend}
          </span>
        )}
      </div>
      {sub && (
        <p className="text-xs text-[#8c959f] mt-3 pt-3 border-t border-[#f6f8fa]">{sub}</p>
      )}
    </motion.div>
  );
}

// ── Quick action row ─────────────────────────────────────────
function QuickAction({ iconBg, icon: Icon, iconColor, title, sub, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-[#d0d7de]
        w-full text-left mb-2 last:mb-0 hover:border-[#0969da] transition-all duration-150 bg-white"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.1 }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="size-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#1c2128]">{title}</h4>
        <p className="text-xs text-[#57606a]">{sub}</p>
      </div>
      <ChevronRightIcon className="size-4 text-[#d0d7de] flex-shrink-0" />
    </motion.button>
  );
}

// ── Pipeline bar ─────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "Applied",   color: "#d0d7de", count: 0 },
  { key: "Screened",  color: "#0969da", count: 0 },
  { key: "Interview", color: "#8250df", count: 0 },
  { key: "Offer",     color: "#bf8700", count: 0 },
  { key: "Hired",     color: "#1a7f37", count: 0 },
];

// ── Main page ────────────────────────────────────────────────
function CompanyDashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  // ── Existing hooks — untouched ───────────────
  const { data: activeData } = useActiveSessions();
  const activeSessions = activeData?.sessions ?? [];

  const { data: schedData } = useScheduledSessions();
  const scheduledSessions = schedData?.sessions ?? [];

  const firstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "there";
  const greeting = getGreeting();

  // stat variants for stagger
  const containerVariants = {
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* ══ HERO HEADER ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-8 px-6"
        style={{
          background: "linear-gradient(135deg, #0969da 0%, #0550ae 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10 gap-6">
          {/* Left */}
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 font-medium">
              Recruiter Dashboard
            </p>
            <h1 className="text-2xl font-bold text-white">
              Good {greeting}, {firstName}!
            </h1>
            <p className="text-white/70 text-sm mt-1">
              You have{" "}
              <span className="text-white font-semibold">
                {scheduledSessions.length}
              </span>{" "}
              {scheduledSessions.length === 1 ? "interview" : "interviews"} scheduled
              {activeSessions.length > 0 && (
                <>
                  {" "}and{" "}
                  <span className="text-white font-semibold">
                    {activeSessions.length}
                  </span>{" "}
                  active session{activeSessions.length !== 1 ? "s" : ""}
                </>
              )}
              .
            </p>
          </div>

          {/* Right — CTA buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button
              onClick={() => navigate("/company/jobs")}
              className="flex items-center gap-2 bg-white text-[#0969da] font-semibold
                rounded-lg px-4 py-2 text-sm hover:bg-[#f6f8fa] transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              <PlusIcon className="size-4" />
              Post a Job
            </motion.button>
            <motion.button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 text-white font-medium rounded-lg
                px-4 py-2 text-sm border border-white/25 hover:bg-white/20 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
              whileTap={{ scale: 0.97 }}
            >
              <CalendarIcon className="size-4" />
              Create Interview
            </motion.button>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 -mt-1 pt-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <StatCard
            icon={BriefcaseIcon}
            label="Active Jobs"
            value={0}
            sub="0 total · 0 drafts"
            trend="+0 new"
            iconBg="#ddf4ff"
            iconColor="#0969da"
            topColor="#0969da"
          />
          <StatCard
            icon={UsersIcon}
            label="Total applicants"
            value={0}
            sub="0 pending review"
            iconBg="#dafbe1"
            iconColor="#1a7f37"
            topColor="#1a7f37"
          />
          <StatCard
            icon={VideoIcon}
            label="Interviews today"
            value={activeSessions.length}
            sub={
              scheduledSessions.length > 0
                ? `Next ${formatDistanceToNow(
                    new Date(scheduledSessions[0]?.scheduledAt || Date.now()),
                    { addSuffix: true }
                  )}`
                : "No upcoming sessions"
            }
            iconBg="#fbefff"
            iconColor="#8250df"
            topColor="#8250df"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Hired this month"
            value={0}
            sub="0 offers pending"
            iconBg="#fff8c5"
            iconColor="#bf8700"
            topColor="#bf8700"
          />
        </motion.div>
      </div>

      {/* ══ MAIN GRID ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="max-w-7xl mx-auto px-6 py-6 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ══ LEFT: lg:col-span-2 ════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── SECTION A: Active Job Postings ─────────────── */}
            <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#f6f8fa]">
                <SectionLabel>Active Jobs</SectionLabel>
                <Link
                  to="/company/jobs"
                  className="text-[#0969da] text-xs hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>

              {/* Empty state */}
              <div className="px-5 py-10 text-center border-2 border-dashed border-[#d0d7de] rounded-xl m-4">
                <BriefcaseIcon className="size-10 text-[#d0d7de] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#1c2128]">No jobs posted yet</p>
                <p className="text-xs text-[#8c959f] mt-1">Create your first job to start receiving applications</p>
                <button
                  onClick={() => navigate("/company/jobs")}
                  className="mt-4 bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg
                    px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Post a Job
                </button>
              </div>
            </div>

            {/* ── SECTION B: Live Sessions ───────────────────── */}
            <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#f6f8fa]">
                <SectionLabel>Live Sessions</SectionLabel>
                <span className="text-[10px] text-[#8c959f]">
                  {activeSessions.length} active
                </span>
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-5">
                  <div className="bg-[#f6f8fa] rounded-xl p-8 text-center">
                    <VideoIcon className="size-8 text-[#d0d7de] mx-auto mb-2" />
                    <p className="text-sm text-[#8c959f]">No active sessions right now</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  {activeSessions.map((session) => {
                    const initials = (session.host?.name || "?")[0].toUpperCase();
                    return (
                      <div
                        key={session._id}
                        className="bg-[#f6f8fa] rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0969da] text-white text-sm
                            font-bold flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#1c2128]">
                              {session.problem || "No problem selected"}
                            </p>
                            <p className="text-xs text-[#57606a] mt-0.5">
                              {session.host?.name || "Unknown host"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0969da] animate-pulse" />
                            <span className="text-xs font-semibold text-[#0969da]">Live</span>
                          </div>
                          <button
                            onClick={() => navigate(`/session/${session._id}`)}
                            className="bg-[#0969da] hover:bg-[#0550ae] text-white text-xs
                              px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Join →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION C: Hiring Pipeline ─────────────────── */}
            <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#f6f8fa]">
                <SectionLabel>Hiring Pipeline</SectionLabel>
                <Link to="/company/pipeline" className="text-[#0969da] text-xs hover:underline font-medium">
                  Full view →
                </Link>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 gap-3">
                  {PIPELINE_STAGES.map((stage) => (
                    <div key={stage.key} className="text-center">
                      <p className="text-base font-semibold mb-2" style={{ color: stage.color }}>
                        {stage.count}
                      </p>
                      <div className="w-full h-2 bg-[#f6f8fa] rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: stage.color,
                            width: stage.count === 0 ? "0%" : "100%",
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#57606a]">{stage.key}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: lg:col-span-1 ═══════════════════════════ */}
          <div className="space-y-5">

            {/* ── CARD A: Upcoming Interviews ─────────────────── */}
            <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#f6f8fa]">
                <SectionLabel>Upcoming Interviews</SectionLabel>
              </div>

              {scheduledSessions.length === 0 ? (
                <div className="p-5 text-center">
                  <CalendarIcon className="size-8 text-[#d0d7de] mx-auto mb-2" />
                  <p className="text-sm text-[#8c959f]">No interviews scheduled</p>
                </div>
              ) : (
                <div className="px-5">
                  {scheduledSessions.slice(0, 5).map((session, i) => (
                    <div
                      key={session._id}
                      className="py-3 border-b border-[#f6f8fa] last:border-0"
                    >
                      <p className="text-xs text-[#0969da] font-medium mb-0.5">
                        {session.scheduledAt
                          ? formatDistanceToNow(new Date(session.scheduledAt), {
                              addSuffix: true,
                            })
                          : "Unscheduled"}
                      </p>
                      <p className="text-sm font-medium text-[#1c2128]">
                        {session.problem || "Interview session"}
                      </p>
                      <p className="text-xs text-[#57606a] mt-0.5">
                        {session.participant?.name || session.candidateEmail || "Awaiting participant"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── CARD B: Quick Actions ────────────────────────── */}
            <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#f6f8fa]">
                <SectionLabel>Quick Actions</SectionLabel>
              </div>
              <div className="p-4">
                <QuickAction
                  icon={PlusIcon}
                  iconBg="#ddf4ff"
                  iconColor="#0969da"
                  title="Post new job"
                  sub="Create a job listing"
                  onClick={() => navigate("/company/jobs")}
                />
                <QuickAction
                  icon={UsersIcon}
                  iconBg="#dafbe1"
                  iconColor="#1a7f37"
                  title="Browse candidates"
                  sub="Review applications"
                  onClick={() => navigate("/company/candidates")}
                />
                <QuickAction
                  icon={CalendarIcon}
                  iconBg="#fbefff"
                  iconColor="#8250df"
                  title="Schedule interview"
                  sub="Book a session"
                  onClick={() => setCreateOpen(true)}
                />
                <QuickAction
                  icon={KanbanIcon}
                  iconBg="#fff8c5"
                  iconColor="#bf8700"
                  title="View pipeline"
                  sub="Track all stages"
                  onClick={() => navigate("/company/pipeline")}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Session Modal — unchanged */}
      <CreateSessionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

export default CompanyDashboardPage;
