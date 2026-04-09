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
  KanbanIcon,
  ChevronRightIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "../components/CompanyNavbar";
import { useActiveSessions, useCreateSession } from "../hooks/useSessions";
import { useScheduledSessions } from "../hooks/useSchedule";
import CreateSessionModal from "../components/CreateSessionModal";
import JoinCodeModal from "../components/JoinCodeModal";
import { formatDistanceToNow } from "date-fns";
import {
  PageHeader,
  HeaderButton,
  StatCard,
  SectionLabel,
  QuickAction,
  EmptyState,
  T,
} from "../components/ui/CompanyUI";

// ── Helpers ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ── Pipeline bar ─────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "Applied",   color: T.textDim,  count: 0 },
  { key: "Screened",  color: T.primary,  count: 0 },
  { key: "Interview", color: "#7c3aed",  count: 0 },
  { key: "Offer",     color: "#ca8a04",  count: 0 },
  { key: "Hired",     color: "#16a34a",  count: 0 },
];

// ── Main page ────────────────────────────────────────────────
function CompanyDashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  // Join code modal state
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [createdJoinCode, setCreatedJoinCode] = useState("");
  const [createdJoinLink, setCreatedJoinLink] = useState("");
  const [createdSessionId, setCreatedSessionId] = useState(null);

  const createSessionMutation = useCreateSession();

  // ── Existing hooks — untouched ───────────────
  const { data: activeData } = useActiveSessions();
  const activeSessions = activeData?.sessions ?? [];

  const { data: schedData } = useScheduledSessions();
  const scheduledSessions = schedData?.sessions ?? [];

  const firstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "there";
  const greeting = getGreeting();

  const handleCreateRoom = (extra = {}) => {
    createSessionMutation.mutate(
      { ...extra },
      {
        onSuccess: (data) => {
          setCreateOpen(false);
          setCreatedJoinCode(data.joinCode);
          setCreatedJoinLink(data.joinLink);
          setCreatedSessionId(data.session._id);
          setShowJoinCodeModal(true);
          // Refresh session lists
          queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
          queryClient.invalidateQueries({ queryKey: ["scheduled-sessions"] });
        },
      }
    );
  };

  // stat variants for stagger
  const containerVariants = {
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.bgPage }}>
      <CompanyNavbar />

      <main id="main-content">
        {/* ══ HERO HEADER ══════════════════════════════════════════ */}
        <PageHeader
        eyebrow="Recruiter Dashboard"
        title={`Good ${greeting}, ${firstName}!`}
        subtitle={
          <>
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
          </>
        }
      >
        <HeaderButton
          onClick={() => navigate("/company/jobs")}
          icon={PlusIcon}
        >
          Post a Job
        </HeaderButton>
        <HeaderButton
          onClick={() => setCreateOpen(true)}
          icon={CalendarIcon}
          variant="ghost"
        >
          Create Interview
        </HeaderButton>
      </PageHeader>

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
            accentColor={T.primary}
          />
          <StatCard
            icon={UsersIcon}
            label="Total applicants"
            value={0}
            sub="0 pending review"
            accentColor="#16a34a"
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
            accentColor="#7c3aed"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Hired this month"
            value={0}
            sub="0 offers pending"
            accentColor="#ca8a04"
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
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${T.borderLight}` }}
              >
                <SectionLabel>Active Jobs</SectionLabel>
                <Link
                  to="/company/jobs"
                  className="text-xs hover:underline font-medium"
                  style={{ color: T.primary }}
                >
                  View all →
                </Link>
              </div>

              {/* Empty state */}
              <div className="p-4">
                <EmptyState
                  icon={BriefcaseIcon}
                  title="No jobs posted yet"
                  subtitle="Create your first job to start receiving applications"
                  action="Post a Job"
                  onAction={() => navigate("/company/jobs")}
                />
              </div>
            </div>

            {/* ── SECTION B: Live Sessions ───────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${T.borderLight}` }}
              >
                <SectionLabel>Live Sessions</SectionLabel>
                <span className="text-[10px]" style={{ color: T.textDim }}>
                  {activeSessions.length} active
                </span>
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-5">
                  <div
                    className="rounded-xl p-8 text-center"
                    style={{ backgroundColor: T.bgPage }}
                  >
                    <VideoIcon className="size-8 mx-auto mb-2" style={{ color: T.border }} />
                    <p className="text-sm" style={{ color: T.textDim }}>No active sessions right now</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  {activeSessions.map((session) => {
                    const initials = (session.host?.name || "?")[0].toUpperCase();
                    return (
                      <div
                        key={session._id}
                        className="rounded-xl p-4 flex items-center justify-between"
                        style={{ backgroundColor: T.bgPage }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: T.primary }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: T.textPrimary }}>
                              {session.problem || "No problem selected"}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                              {session.host?.name || "Unknown host"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ backgroundColor: T.primary }}
                            />
                            <span className="text-xs font-semibold" style={{ color: T.primary }}>Live</span>
                          </div>
                          <button
                            onClick={() => navigate(`/session/${session._id}`)}
                            className="text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
                            style={{ backgroundColor: T.primary }}
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
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${T.borderLight}` }}
              >
                <SectionLabel>Hiring Pipeline</SectionLabel>
                <Link
                  to="/company/pipeline"
                  className="text-xs hover:underline font-medium"
                  style={{ color: T.primary }}
                >
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
                      <div
                        className="w-full h-2 rounded-full overflow-hidden mb-2"
                        style={{ backgroundColor: T.bgPage }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: stage.color,
                            width: stage.count === 0 ? "0%" : "100%",
                          }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: T.textMuted }}>{stage.key}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: lg:col-span-1 ═══════════════════════════ */}
          <div className="space-y-5">

            {/* ── CARD A: Upcoming Interviews ─────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${T.borderLight}` }}
              >
                <SectionLabel>Upcoming Interviews</SectionLabel>
              </div>

              {scheduledSessions.length === 0 ? (
                <div className="p-5 text-center">
                  <CalendarIcon className="size-8 mx-auto mb-2" style={{ color: T.border }} />
                  <p className="text-sm" style={{ color: T.textDim }}>No interviews scheduled</p>
                </div>
              ) : (
                <div className="px-5">
                  {scheduledSessions.slice(0, 5).map((session) => (
                    <div
                      key={session._id}
                      className="py-3 last:border-0"
                      style={{ borderBottom: `1px solid ${T.borderLight}` }}
                    >
                      <p className="text-xs font-medium mb-0.5" style={{ color: T.primary }}>
                        {session.scheduledAt
                          ? formatDistanceToNow(new Date(session.scheduledAt), {
                              addSuffix: true,
                            })
                          : "Unscheduled"}
                      </p>
                      <p className="text-sm font-medium" style={{ color: T.textPrimary }}>
                        {session.problem || "Interview session"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                        {session.participant?.name || session.candidateEmail || "Awaiting participant"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── CARD B: Quick Actions ────────────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}
            >
              <div
                className="p-5"
                style={{ borderBottom: `1px solid ${T.borderLight}` }}
              >
                <SectionLabel>Quick Actions</SectionLabel>
              </div>
              <div className="p-4">
                <QuickAction
                  icon={PlusIcon}
                  accentColor={T.primary}
                  title="Post new job"
                  sub="Create a job listing"
                  onClick={() => navigate("/company/jobs")}
                />
                <QuickAction
                  icon={UsersIcon}
                  accentColor="#16a34a"
                  title="Browse candidates"
                  sub="Review applications"
                  onClick={() => navigate("/company/candidates")}
                />
                <QuickAction
                  icon={CalendarIcon}
                  accentColor="#7c3aed"
                  title="Schedule interview"
                  sub="Book a session"
                  onClick={() => setCreateOpen(true)}
                />
                <QuickAction
                  icon={KanbanIcon}
                  accentColor="#ca8a04"
                  title="View pipeline"
                  sub="Track all stages"
                  onClick={() => navigate("/company/pipeline")}
                />
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </main>

      <CreateSessionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />

      <JoinCodeModal
        isOpen={showJoinCodeModal}
        onClose={() => {
          setShowJoinCodeModal(false);
          if (createdSessionId) {
            navigate(`/session/${createdSessionId}`);
          }
        }}
        joinCode={createdJoinCode}
        joinLink={createdJoinLink}
      />
    </div>
  );
}

export default CompanyDashboardPage;
