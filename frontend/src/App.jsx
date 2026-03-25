import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { axiosInstance } from "./lib/axios";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulePage from "./pages/SchedulePage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminPage from "./pages/AdminPage";
import PipelinePage from "./pages/PipelinePage";
import JoinPage from "./pages/JoinPage";
import AIPracticePage from "./pages/AIPracticePage";
import AIPracticeHistoryPage from "./pages/AIPracticeHistoryPage";
import DailyChallengePage from "./pages/DailyChallengePage";
import CompanyTracksPage from "./pages/CompanyTracksPage";
import InboxPage from "./pages/InboxPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import CompanyPipelinePage from "./pages/company/CompanyPipelinePage";
import CompanyInboxPage from "./pages/company/CompanyInboxPage";
import CompanyProfilePage from "./pages/company/CompanyProfilePage";
import CompanyJobsPage from "./pages/company/CompanyJobsPage";
import CompanyJobDetailPage from "./pages/company/CompanyJobDetailPage";
import CompanyCandidatesPage from "./pages/company/CompanyCandidatesPage";
import CompanyInterviewsPage from "./pages/company/CompanyInterviewsPage";
import CompanyAIMatchingPage from "./pages/company/CompanyAIMatchingPage";
import CompanyOffersPage from "./pages/company/CompanyOffersPage";
import JobBoardPage from "./pages/JobBoardPage";
import JobDetailPage from "./pages/JobDetailPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";

// ── RoleBasedRedirect ────────────────────────────────────────
// Used on "/" for signed-in users: fetches DB role, sends to
// correct dashboard.
function RoleBasedRedirect() {
  const [destination, setDestination] = useState(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        const role = res.data.user?.role;
        if (role === "interviewer" || role === "recruiter") {
          setDestination("/company/dashboard");
        } else {
          setDestination("/dashboard");
        }
      } catch {
        setDestination("/dashboard");
      }
    };
    if (isSignedIn) check();
  }, [isSignedIn]);

  if (!destination)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return <Navigate to={destination} replace />;
}

// ── DeveloperOnlyRoute ────────────────────────────────────────
// Wraps candidate pages. Company users are bounced to
// /company/dashboard.
function DeveloperOnlyRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        const role = res.data.user?.role;
        if (role === "interviewer" || role === "recruiter") {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch {
        setAllowed(true);
      }
    };
    check();
  }, []);

  if (allowed === null)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!allowed) return <Navigate to="/company/dashboard" replace />;
  return children;
}

// ── CompanyOnlyRoute ──────────────────────────────────────────
// Wraps company pages. Candidate/admin users are bounced to
// /dashboard.
function CompanyOnlyRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        const role = res.data.user?.role;
        if (role === "interviewer" || role === "recruiter") {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch {
        setAllowed(false);
      }
    };
    check();
  }, []);

  if (allowed === null)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  // ── Role-based redirect after login ──────────────────────
  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    const handleRoleRedirect = async () => {
      const pendingRole = localStorage.getItem("talentiq_selected_role");

      if (pendingRole) {
        // New login — role was selected on RoleSelectPage before sign-in
        try {
          await axiosInstance.post("/users/set-role", { role: pendingRole });
          localStorage.removeItem("talentiq_selected_role");
          if (pendingRole === "interviewer") {
            navigate("/company/dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } catch (err) {
          console.error("Role set failed:", err);
          localStorage.removeItem("talentiq_selected_role");
          navigate("/dashboard", { replace: true });
        }
      } else {
        // Returning user — check their stored role and redirect intelligently
        try {
          const res = await axiosInstance.get("/users/profile");
          const role = res.data.user?.role;
          if (role === "interviewer" || role === "recruiter") {
            // Only redirect if currently on unauthenticated pages
            const path = window.location.pathname;
            if (path === "/" || path === "/role-select") {
              navigate("/company/dashboard", { replace: true });
            }
          }
        } catch {
          // profile fetch failed — fall through to existing routes
        }
      }
    };

    handleRoleRedirect();
  }, [isSignedIn, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <RoleBasedRedirect />}
        />
        <Route
          path="/role-select"
          element={!isSignedIn ? <RoleSelectPage /> : <Navigate to="/dashboard" />}
        />

        {/* ── Candidate dashboard ───────────────────────── */}
        <Route
          path="/dashboard"
          element={
            isSignedIn
              ? <DeveloperOnlyRoute><DashboardPage /></DeveloperOnlyRoute>
              : <Navigate to="/" />
          }
        />

        {/* ── Company (interviewer) dashboard ───────────── */}
        <Route
          path="/company/dashboard"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyDashboardPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />

        {/* ── Company profile ───────────────────────────── */}
        <Route
          path="/company/profile"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyProfilePage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />

        {/* ── Company sub-pages ─────────────────────────── */}
        <Route
          path="/company/pipeline"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyPipelinePage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/inbox"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyInboxPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/jobs"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyJobsPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/jobs/:id"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyJobDetailPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/candidates"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyCandidatesPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/interviews"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyInterviewsPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/ai-matching"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyAIMatchingPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/company/offers"
          element={
            isSignedIn
              ? <CompanyOnlyRoute><CompanyOffersPage /></CompanyOnlyRoute>
              : <Navigate to="/" />
          }
        />

        {/* ── Existing protected routes (unchanged) ─────── */}
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />}
        />
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={isSignedIn ? <ProfilePage /> : <Navigate to="/" />}
        />
        <Route
          path="/schedule"
          element={isSignedIn ? <SchedulePage /> : <Navigate to="/" />}
        />
        <Route
          path="/feedback/:id"
          element={isSignedIn ? <FeedbackPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={isSignedIn ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route
          path="/pipeline"
          element={isSignedIn ? <PipelinePage /> : <Navigate to="/" />}
        />
        <Route
          path="/join"
          element={
            isSignedIn
              ? <JoinPage />
              : (() => {
                  const code = new URLSearchParams(window.location.search).get("code");
                  if (code) localStorage.setItem("talentiq_pending_join_code", code);
                  return <Navigate to="/" />;
                })()
          }
        />
        <Route
          path="/ai-practice"
          element={isSignedIn ? <AIPracticePage /> : <Navigate to="/" />}
        />
        <Route
          path="/ai-practice/history"
          element={isSignedIn ? <AIPracticeHistoryPage /> : <Navigate to="/" />}
        />
        <Route
          path="/ai-practice/history/:id"
          element={isSignedIn ? <AIPracticeHistoryPage /> : <Navigate to="/" />}
        />
        <Route
          path="/daily-challenge"
          element={isSignedIn ? <DailyChallengePage /> : <Navigate to="/" />}
        />
        <Route
          path="/company-tracks"
          element={isSignedIn ? <CompanyTracksPage /> : <Navigate to="/" />}
        />
        <Route
          path="/inbox"
          element={isSignedIn ? <InboxPage /> : <Navigate to="/" />}
        />

        {/* ── Developer job browsing & applications ───── */}
        <Route
          path="/jobs"
          element={
            isSignedIn
              ? <DeveloperOnlyRoute><JobBoardPage /></DeveloperOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/jobs/:id"
          element={
            isSignedIn
              ? <DeveloperOnlyRoute><JobDetailPage /></DeveloperOnlyRoute>
              : <Navigate to="/" />
          }
        />
        <Route
          path="/my-applications"
          element={
            isSignedIn
              ? <DeveloperOnlyRoute><MyApplicationsPage /></DeveloperOnlyRoute>
              : <Navigate to="/" />
          }
        />

        {/* ── 404 ───────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <div
              style={{ backgroundColor: "#f6f8fa" }}
              className="min-h-screen flex flex-col items-center justify-center gap-4"
            >
              <h1 className="text-4xl font-black" style={{ color: "#1c2128" }}>
                404
              </h1>
              <p style={{ color: "#57606a" }}>Page not found</p>
              <a
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: "#0969da" }}
              >
                Go to Dashboard
              </a>
            </div>
          }
        />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
