import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById, useApproveParticipant, useRejectParticipant } from "../hooks/useSessions";
import { useProblemById, useProblems } from "../hooks/useProblems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Code2Icon,
  Loader2Icon,
  LogOutIcon,
  PenToolIcon,
  PhoneOffIcon,
  CalendarIcon,
  AlertTriangleIcon,
  ClockIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import FeedbackModal from "../components/FeedbackModal";
import InterviewerNotes from "../components/InterviewerNotes";
import TabViolationAlert from "../components/TabViolationAlert";
import ViolationsBanner from "../components/ViolationsBanner";
import ProblemSelectorPanel from "../components/ProblemSelectorPanel";
import ProblemDescription from "../components/ProblemDescription";
import { useTabDetection } from "../hooks/useTabDetection";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [interviewerViolationCount, setInterviewerViolationCount] = useState(0);
  const [activeTab, setActiveTab] = useState("code"); // "code" | "whiteboard"
  const socketRef = useRef(null);

  // Access control state
  const [joinCodeInput, setJoinCodeInput] = useState(searchParams.get("code") || "");
  const [joinStatus, setJoinStatus] = useState(null); // null | "pending" | "approved" | "rejected"
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);

  const approveParticipantMutation = useApproveParticipant();
  const rejectParticipantMutation = useRejectParticipant();

  // Countdown state for scheduled sessions
  const [countdown, setCountdown] = useState(null); // { days, hours, minutes, seconds }
  const [canJoinNow, setCanJoinNow] = useState(false);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const serverCanJoin = sessionData?.canJoin;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  // Determine if session is in a waiting state (scheduled and not within buffer)
  const isScheduledWaiting =
    session?.status === "scheduled" && !serverCanJoin;
  const isExpired = session?.status === "expired";

  // Countdown timer for scheduled sessions
  useEffect(() => {
    if (!session?.scheduledAt || session.status === "active" || session.status === "completed" || session.status === "expired") {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const scheduledTime = new Date(session.scheduledAt);
      const diff = scheduledTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCanJoinNow(true);
        return;
      }

      // Can join 2 min early
      if (diff <= 2 * 60 * 1000) {
        setCanJoinNow(true);
      } else {
        setCanJoinNow(false);
      }

      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session?.scheduledAt, session?.status]);

  // Only initialize Stream when user is authorized (host or approved participant)
  const isAuthorized = isHost || isParticipant;
  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    isAuthorized && !isScheduledWaiting && !isExpired ? session : null,
    loadingSession,
    isHost,
    isParticipant
  );

  // fetch problem data from the API by searching title
  const { data: allProblemsData } = useProblems();
  const problemData = session?.problem
    ? allProblemsData?.problems?.find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // ─── Socket.io connection for cheat detection ───────────────────
  useEffect(() => {
    if (!id) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    // Strip /api suffix — Socket.io connects to the server root
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(serverUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket.id);
      socket.emit("join:session", id);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  // ─── Interviewer: listen for violation alerts ───────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isHost) return;

    const handleViolationAlert = (payload) => {
      setInterviewerViolationCount(payload.totalCount);
    };

    socket.on("violation:alert", handleViolationAlert);
    return () => socket.off("violation:alert", handleViolationAlert);
  }, [isHost, socketRef.current]);

  // ─── Host: listen for join requests ─────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isHost) return;

    const handleJoinRequest = (payload) => {
      setPendingJoinRequests((prev) => {
        // Avoid duplicates
        if (prev.some((r) => r.userId === payload.userId)) return prev;
        return [...prev, payload];
      });

      // Show toast notification to host
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold">{payload.name} wants to join</p>
            </div>
            <button
              className="btn btn-success btn-xs gap-1"
              onClick={() => {
                approveParticipantMutation.mutate(
                  { sessionId: id, userId: payload.userId },
                  { onSuccess: () => {
                    setPendingJoinRequests((prev) => prev.filter((r) => r.userId !== payload.userId));
                    refetch();
                  }}
                );
                toast.dismiss(t.id);
              }}
            >
              <UserCheckIcon className="size-3" /> Allow
            </button>
            <button
              className="btn btn-error btn-xs gap-1"
              onClick={() => {
                rejectParticipantMutation.mutate(
                  { sessionId: id, userId: payload.userId },
                  { onSuccess: () => {
                    setPendingJoinRequests((prev) => prev.filter((r) => r.userId !== payload.userId));
                  }}
                );
                toast.dismiss(t.id);
              }}
            >
              <UserXIcon className="size-3" /> Reject
            </button>
          </div>
        ),
        { duration: 30000, position: "top-right" }
      );
    };

    socket.on("join:request", handleJoinRequest);
    return () => socket.off("join:request", handleJoinRequest);
  }, [isHost, socketRef.current, id]);

  // ─── Candidate: listen for join approved / rejected ─────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || isHost) return;

    const handleApproved = (payload) => {
      if (payload.clerkId === user?.id) {
        setJoinStatus("approved");
        toast.success("You've been approved! Entering session...");
        refetch();
      }
    };

    const handleRejected = (payload) => {
      if (payload.clerkId === user?.id) {
        setJoinStatus("rejected");
      }
    };

    socket.on("join:approved", handleApproved);
    socket.on("join:rejected", handleRejected);
    return () => {
      socket.off("join:approved", handleApproved);
      socket.off("join:rejected", handleRejected);
    };
  }, [socketRef.current, isHost, user?.id]);

  // ─── Listen for problem:pushed to refresh session data ─────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleProblemPushed = () => {
      refetch(); // refresh session data to get new problem/difficulty
    };

    socket.on("problem:pushed", handleProblemPushed);
    return () => socket.off("problem:pushed", handleProblemPushed);
  }, [socketRef.current, refetch]);

  // ─── Candidate: tab detection hook ──────────────────────────────
  const { violationCount } = useTabDetection(
    !isHost ? id : null,
    !isHost ? user?.id : null,
    !isHost ? socketRef.current : null
  );

  // ─── Auto-join with code (if code in URL) ──────────────────────
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (session.status === "scheduled" || session.status === "expired") return;
    if (joinStatus === "pending" || joinStatus === "rejected") return;

    const codeFromUrl = searchParams.get("code");
    if (!codeFromUrl) return; // No code → show access gate

    joinSessionMutation.mutate(
      { id, joinCode: codeFromUrl },
      {
        onSuccess: (data) => {
          if (data.status === "pending") {
            setJoinStatus("pending");
          } else if (data.status === "approved") {
            setJoinStatus("approved");
            refetch();
          }
        },
      }
    );
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // Handler for manual code submission from access gate
  const handleCodeSubmit = (e) => {
    e?.preventDefault();
    if (!joinCodeInput.trim()) return;

    joinSessionMutation.mutate(
      { id, joinCode: joinCodeInput.trim() },
      {
        onSuccess: (data) => {
          if (data.status === "pending") {
            setJoinStatus("pending");
          } else if (data.status === "approved") {
            setJoinStatus("approved");
            refetch();
          }
        },
      }
    );
  };

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") {
      if (isHost) {
        setShowFeedback(true);
      } else if (!showFeedback) {
        toast("Session ended. Feedback will appear in your inbox.", {
          icon: "📬",
          duration: 5000,
        });
        navigate("/dashboard");
      }
    }
  }, [session, loadingSession]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      endSessionMutation.mutate(
        { id, code, language: selectedLanguage },
        {
          onSuccess: () => {
            setShowFeedback(true);
          },
        }
      );
    }
  };

  // Lazy-load WhiteboardPanel only when needed
  const [WhiteboardPanel, setWhiteboardPanel] = useState(null);
  useEffect(() => {
    if (activeTab === "whiteboard" && !WhiteboardPanel) {
      import("../components/WhiteboardPanel").then((mod) => {
        setWhiteboardPanel(() => mod.default);
      });
    }
  }, [activeTab]);

  // ─── ACCESS GATE: no code, not authorized ────────────────────────
  if (!loadingSession && session && !isHost && !isParticipant && joinStatus !== "approved" && joinStatus !== "pending") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card bg-base-100 shadow-2xl max-w-md w-full">
            <div className="card-body items-center text-center py-12">
              <div className="size-20 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <KeyRoundIcon className="size-10 text-warning" />
              </div>
              <h2 className="card-title text-2xl mb-2">Enter Session Code</h2>
              <p className="text-base-content/60 mb-6">
                Please enter the 6-character session code provided by your interviewer to join this session.
              </p>

              <form onSubmit={handleCodeSubmit} className="w-full space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter session code"
                  className="input input-bordered w-full text-center text-2xl font-mono font-bold tracking-[0.3em]"
                  autoFocus
                />

                {joinSessionMutation.isError && (
                  <div className="alert alert-error py-2">
                    <span className="text-sm">{joinSessionMutation.error?.response?.data?.message || "Invalid code"}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full gap-2"
                  disabled={joinSessionMutation.isPending || !joinCodeInput.trim()}
                >
                  {joinSessionMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheckIcon className="size-4" />
                  )}
                  Verify & Join
                </button>
              </form>

              <div className="divider text-xs text-base-content/40">OR</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WAITING FOR HOST APPROVAL ──────────────────────────────────
  if (joinStatus === "pending" && !isParticipant) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card bg-base-100 shadow-2xl max-w-md w-full">
            <div className="card-body items-center text-center py-12">
              <div className="size-20 rounded-full bg-info/10 flex items-center justify-center mb-4 relative">
                <Loader2Icon className="size-10 text-info animate-spin" />
              </div>
              <h2 className="card-title text-2xl mb-2">Waiting for Approval</h2>
              <p className="text-base-content/60 mb-4">
                The interviewer has been notified that you'd like to join.
                <br />
                Please wait while they review your request.
              </p>
              <div className="flex items-center gap-2 text-sm text-base-content/40">
                <ClockIcon className="size-4" />
                <span>This page will update automatically</span>
              </div>
              <button
                className="btn btn-ghost btn-sm mt-6"
                onClick={() => navigate("/dashboard")}
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── REQUEST REJECTED ───────────────────────────────────────────
  if (joinStatus === "rejected") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card bg-base-100 shadow-2xl max-w-md w-full">
            <div className="card-body items-center text-center py-12">
              <div className="size-20 rounded-full bg-error/10 flex items-center justify-center mb-4">
                <UserXIcon className="size-10 text-error" />
              </div>
              <h2 className="card-title text-2xl mb-2">Request Denied</h2>
              <p className="text-base-content/60 mb-6">
                The interviewer has declined your request to join this session. Please contact your interviewer for assistance.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXPIRED SCREEN ──────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card bg-base-100 shadow-2xl max-w-lg w-full">
            <div className="card-body items-center text-center py-12">
              <div className="size-20 rounded-full bg-error/10 flex items-center justify-center mb-4">
                <AlertTriangleIcon className="size-10 text-error" />
              </div>
              <h2 className="card-title text-2xl mb-2">Session Expired</h2>
              <p className="text-base-content/60 mb-6">
                This interview session has expired because the host did not start the meeting within 15 minutes of the scheduled time.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WAITING SCREEN (scheduled, not yet in 2-min buffer) ─────────
  if (isScheduledWaiting && !canJoinNow) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card bg-base-100 shadow-2xl max-w-lg w-full">
            <div className="card-body items-center text-center py-12">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CalendarIcon className="size-10 text-primary" />
              </div>
              <h2 className="card-title text-2xl mb-2">Session Scheduled</h2>
              <p className="text-base-content/60 mb-6">
                This interview session is scheduled for{" "}
                <span className="font-semibold text-base-content">
                  {session?.scheduledAt
                    ? new Date(session.scheduledAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "a later time"}
                </span>
                . You will be able to join 2 minutes before the session starts.
              </p>

              {/* Countdown */}
              {countdown && (
                <div className="flex gap-3 mb-6">
                  {countdown.days > 0 && (
                    <div className="flex flex-col items-center bg-base-200 rounded-xl px-4 py-3 min-w-[60px]">
                      <span className="text-2xl font-black text-primary">{countdown.days}</span>
                      <span className="text-xs text-base-content/50 uppercase">Days</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center bg-base-200 rounded-xl px-4 py-3 min-w-[60px]">
                    <span className="text-2xl font-black text-primary">
                      {String(countdown.hours).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-base-content/50 uppercase">Hours</span>
                  </div>
                  <div className="flex flex-col items-center bg-base-200 rounded-xl px-4 py-3 min-w-[60px]">
                    <span className="text-2xl font-black text-primary">
                      {String(countdown.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-base-content/50 uppercase">Min</span>
                  </div>
                  <div className="flex flex-col items-center bg-base-200 rounded-xl px-4 py-3 min-w-[60px]">
                    <span className="text-2xl font-black text-secondary">
                      {String(countdown.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-base-content/50 uppercase">Sec</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-base-content/40">
                <ClockIcon className="size-4" />
                <span>The page will automatically update when it's time to join</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-base-content">
                          {session?.problem || (session ? "No problem selected" : "Loading...")}
                        </h1>
                        {problemData?.category && (
                          <p className="text-base-content/60 mt-1">{problemData.category}</p>
                        )}
                        <p className="text-base-content/60 mt-2">
                          Host: {session?.host?.name || "Loading..."} •{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {session?.difficulty && (
                          <span
                            className={`badge badge-lg ${getDifficultyBadgeClass(
                              session.difficulty
                            )}`}
                          >
                            {session.difficulty.slice(0, 1).toUpperCase() +
                              session.difficulty.slice(1)}
                          </span>
                        )}

                        {/* Interviewer Notes */}
                        {isHost && (
                          <InterviewerNotes
                            sessionId={id}
                            onSave={(notes) => console.log("Notes saved:", notes)}
                          />
                        )}

                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>

                    {/* Interviewer: violation alert banner */}
                    {isHost && (
                      <ViolationsBanner count={interviewerViolationCount} />
                    )}

                    {/* Candidate: tab-switch warning banner */}
                    {!isHost && (
                      <TabViolationAlert count={violationCount} />
                    )}
                  </div>

                  {/* Interviewer: ProblemSelectorPanel */}
                  {isHost && (
                    <div className="p-4">
                      <ProblemSelectorPanel
                        sessionId={id}
                        activeProblemId={problemData?._id}
                      />
                    </div>
                  )}

                  {/* Problem Description — for all roles */}
                  <ProblemDescription
                    problem={problemData}
                    socket={socketRef.current}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                {/* Tab switcher: Code / Whiteboard */}
                <div className="flex border-b border-base-300 bg-base-100">
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === "code"
                        ? "border-primary text-primary"
                        : "border-transparent text-base-content/60 hover:text-base-content"
                    }`}
                  >
                    <Code2Icon className="size-4" />
                    Code Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("whiteboard")}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === "whiteboard"
                        ? "border-primary text-primary"
                        : "border-transparent text-base-content/60 hover:text-base-content"
                    }`}
                  >
                    <PenToolIcon className="size-4" />
                    Whiteboard
                  </button>
                </div>

                {activeTab === "code" ? (
                  <PanelGroup direction="vertical">
                    <Panel defaultSize={70} minSize={30}>
                      <CodeEditorPanel
                        selectedLanguage={selectedLanguage}
                        code={code}
                        isRunning={isRunning}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={(value) => setCode(value)}
                        onRunCode={handleRunCode}
                        sessionId={id}
                      />
                    </Panel>

                    <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                    <Panel defaultSize={30} minSize={15}>
                      <OutputPanel output={output} isRunning={isRunning} />
                    </Panel>
                  </PanelGroup>
                ) : (
                  <div className="h-full">
                    {WhiteboardPanel ? (
                      <WhiteboardPanel />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Loader2Icon className="size-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Feedback Modal — shown when session ends */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          navigate("/dashboard");
        }}
        sessionId={id}
        candidateId={session?.participant?.clerkId || session?.candidateId || ""}
      />
    </div>
  );
}

export default SessionPage;
