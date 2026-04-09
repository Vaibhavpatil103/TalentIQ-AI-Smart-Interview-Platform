import { useState, useEffect, lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { axiosInstance } from "./lib/axios";
import { MotionConfig } from "framer-motion";
import { useUserProfile } from "./hooks/useUserProfile";

// ─── Lazy-loaded pages (route-based code splitting) ──────────────
// Each page is loaded only when the user navigates to it,
// reducing the initial bundle from ~6MB to ~500KB.
const HomePage = lazy(() => import("./pages/HomePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const JoinPage = lazy(() => import("./pages/JoinPage"));
const AIPracticePage = lazy(() => import("./pages/AIPracticePage"));
const AIPracticeHistoryPage = lazy(() => import("./pages/AIPracticeHistoryPage"));
const InboxPage = lazy(() => import("./pages/InboxPage"));
const RoleSelectPage = lazy(() => import("./pages/RoleSelectPage"));
const CompanyDashboardPage = lazy(() => import("./pages/CompanyDashboardPage"));
const CompanyPipelinePage = lazy(() => import("./pages/company/CompanyPipelinePage"));
const CompanyInboxPage = lazy(() => import("./pages/company/CompanyInboxPage"));
const CompanyProfilePage = lazy(() => import("./pages/company/CompanyProfilePage"));
const CompanyJobsPage = lazy(() => import("./pages/company/CompanyJobsPage"));
const CompanyJobDetailPage = lazy(() => import("./pages/company/CompanyJobDetailPage"));
const CompanyCandidatesPage = lazy(() => import("./pages/company/CompanyCandidatesPage"));
const CompanyInterviewsPage = lazy(() => import("./pages/company/CompanyInterviewsPage"));
const CompanyAIMatchingPage = lazy(() => import("./pages/company/CompanyAIMatchingPage"));
const CompanyOffersPage = lazy(() => import("./pages/company/CompanyOffersPage"));
const JobBoardPage = lazy(() => import("./pages/JobBoardPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const MyApplicationsPage = lazy(() => import("./pages/MyApplicationsPage"));

// ─── Page loading spinner (shown during lazy chunk load) ─────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#0969da] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#57606a] font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ─── Error Boundary ──────────────────────────────────────────────
// Catches render errors in any lazy-loaded page and shows a
// recovery UI instead of a white screen.
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1c2128]">Something went wrong</h2>
          <p className="text-sm text-[#57606a] text-center max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-[#0969da] text-white text-sm font-medium hover:bg-[#0860c4] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── RoleBasedRedirect ────────────────────────────────────────
// Used on "/" for signed-in users: fetches DB role, sends to
// correct dashboard.
function RoleBasedRedirect() {
  const { data: userProfile, isLoading, isError } = useUserProfile();

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (isError || !userProfile) return <Navigate to="/dashboard" replace />;

  if (userProfile.role === "interviewer" || userProfile.role === "recruiter") {
    return <Navigate to="/company/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}

// ── DeveloperOnlyRoute ────────────────────────────────────────
// Wraps candidate pages. Company users are bounced to
// /company/dashboard.
function DeveloperOnlyRoute({ children }) {
  const { data: userProfile, isLoading, isError } = useUserProfile();

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!isError && userProfile && (userProfile.role === "interviewer" || userProfile.role === "recruiter")) {
    return <Navigate to="/company/dashboard" replace />;
  }
  
  return children;
}

// ── CompanyOnlyRoute ──────────────────────────────────────────
// Wraps company pages. Candidate/admin users are bounced to
// /dashboard.
function CompanyOnlyRoute({ children }) {
  const { data: userProfile, isLoading, isError } = useUserProfile();

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (isError || !userProfile || (userProfile.role !== "interviewer" && userProfile.role !== "recruiter")) {
    return <Navigate to="/dashboard" replace />;
  }

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
    <MotionConfig reducedMotion="user">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-[var(--dark-accent)] text-white px-4 py-2 rounded-md font-bold shadow-xl"
      >
        Skip to main content
      </a>
      <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      </ErrorBoundary>

      <Toaster toastOptions={{ 
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }
      }} />
    </MotionConfig>
  );
}

export default App;
