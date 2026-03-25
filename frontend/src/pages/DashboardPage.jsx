import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import { useScheduledSessions } from "../hooks/useSchedule";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import JoinCodeModal from "../components/JoinCodeModal";
import { CalendarIcon, ClockIcon, BriefcaseIcon, LayersIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { Link } from "react-router";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Join code modal state
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [createdJoinCode, setCreatedJoinCode] = useState("");
  const [createdJoinLink, setCreatedJoinLink] = useState("");
  const [createdSessionId, setCreatedSessionId] = useState(null);

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();
  const { data: scheduledData } = useScheduledSessions();

  const handleCreateRoom = (extra = {}) => {
    createSessionMutation.mutate(
      {
        ...extra,
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          setCreatedJoinCode(data.joinCode);
          setCreatedJoinLink(data.joinLink);
          setCreatedSessionId(data.session._id);
          setShowJoinCodeModal(true);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const scheduledSessions = scheduledData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;
    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      
      <WelcomeSection
        onCreateSession={() => setShowCreateModal(true)}
        onJoinSession={() => navigate("/join")}
      />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 pb-16"
      >
        {/* Scheduled Sessions Scrollable Row */}
        {scheduledSessions.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs uppercase tracking-wider text-[#7d8590] font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="size-4" />
              Upcoming Interviews
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
              {scheduledSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/session/${session._id}`}
                  className="card-dark-hover min-w-[260px] p-5 snap-start flex flex-col justify-between"
                  style={{ borderLeft: "2px solid #2cbe4e" }}
                >
                  <div>
                    <h3 className="font-semibold text-[#e6edf3] truncate mb-2">{session.problem}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-[#7d8590] mb-3">
                      <ClockIcon className="size-4" />
                      {session.scheduledAt
                        ? new Date(session.scheduledAt).toLocaleString([], {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })
                        : "Time TBD"}
                    </div>
                  </div>
                  <div>
                    <span 
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(56, 139, 253, 0.12)",
                        color: "#388bfd",
                        border: "1px solid rgba(56, 139, 253, 0.2)"
                      }}
                    >
                      Scheduled
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StatsCards
            activeSessionsCount={activeSessions.length}
            recentSessionsCount={recentSessions.length}
          />
          <ActiveSessions
            sessions={activeSessions}
            isLoading={loadingActiveSessions}
            isUserInSession={isUserInSession}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-wider text-[#7d8590] font-semibold mb-4 flex items-center gap-2">
            <ZapIcon className="size-4" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/jobs" className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[rgba(44,190,78,0.3)] transition-all block">
              <BriefcaseIcon className="size-6 text-[#2cbe4e] mb-3" />
              <p className="font-semibold text-[#e6edf3] text-sm">Browse Jobs</p>
              <p className="text-xs text-[#7d8590] mt-1">Find and apply to open positions</p>
            </Link>
            <Link to="/my-applications" className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[rgba(56,139,253,0.3)] transition-all block">
              <LayersIcon className="size-6 text-[#388bfd] mb-3" />
              <p className="font-semibold text-[#e6edf3] text-sm">My Applications</p>
              <p className="text-xs text-[#7d8590] mt-1">Track your application status</p>
            </Link>
            <Link to="/ai-practice" className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[rgba(210,153,34,0.3)] transition-all block">
              <SparklesIcon className="size-6 text-[#d29922] mb-3" />
              <p className="font-semibold text-[#e6edf3] text-sm">AI Practice</p>
              <p className="text-xs text-[#7d8590] mt-1">Prepare for your interviews</p>
            </Link>
          </div>
        </div>

        <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
      </motion.main>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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

export default DashboardPage;
