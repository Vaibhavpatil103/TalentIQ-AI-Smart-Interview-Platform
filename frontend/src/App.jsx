import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
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

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path="/profile" element={isSignedIn ? <ProfilePage /> : <Navigate to={"/"} />} />
        <Route path="/schedule" element={isSignedIn ? <SchedulePage /> : <Navigate to={"/"} />} />
        <Route path="/feedback/:id" element={isSignedIn ? <FeedbackPage /> : <Navigate to={"/"} />} />
        <Route path="/admin" element={isSignedIn ? <AdminPage /> : <Navigate to={"/"} />} />
        <Route path="/pipeline" element={isSignedIn ? <PipelinePage /> : <Navigate to={"/"} />} />
        <Route path="/join" element={isSignedIn ? <JoinPage /> : (() => {
          const code = new URLSearchParams(window.location.search).get("code");
          if (code) localStorage.setItem("talentiq_pending_join_code", code);
          return <Navigate to="/" />;
        })()} />
        <Route path="/ai-practice" element={isSignedIn ? <AIPracticePage /> : <Navigate to="/" />} />
        <Route path="/ai-practice/history" element={isSignedIn ? <AIPracticeHistoryPage /> : <Navigate to="/" />} />
        <Route path="/ai-practice/history/:id" element={isSignedIn ? <AIPracticeHistoryPage /> : <Navigate to="/" />} />
        <Route path="/daily-challenge" element={isSignedIn ? <DailyChallengePage /> : <Navigate to="/" />} />
        <Route path="/company-tracks" element={isSignedIn ? <CompanyTracksPage /> : <Navigate to="/" />} />
        <Route path="/inbox" element={isSignedIn ? <InboxPage /> : <Navigate to="/" />} />
        <Route path="*" element={
          <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-black">404</h1>
            <p className="text-base-content/60">Page not found</p>
            <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          </div>
        } />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
