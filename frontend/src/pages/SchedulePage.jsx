import { AlertTriangleIcon, CalendarIcon, ClockIcon, Loader2Icon, UserIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useScheduledSessions } from "../hooks/useSchedule";
import { Link } from "react-router";
import { format } from "date-fns";

function SchedulePage() {
  const { data, isLoading } = useScheduledSessions();
  const sessions = data?.sessions || [];

  const getJoinState = (session) => {
    if (session.status === "expired") return "expired";
    if (!session.scheduledAt) return "joinable";

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const msUntilStart = scheduledTime - now;

    // Within 2-minute buffer or past start time
    if (msUntilStart <= 2 * 60 * 1000) return "joinable";
    return "waiting";
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Scheduled Interviews</h1>
            <p className="text-base-content/60">Your upcoming interview sessions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="size-10 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <CalendarIcon className="size-16 text-base-content/20 mb-4" />
              <h2 className="text-xl font-bold">No Scheduled Interviews</h2>
              <p className="text-base-content/60">
                Schedule your first interview from the dashboard
              </p>
              <Link to="/dashboard" className="btn btn-primary mt-4">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const joinState = getJoinState(session);

              return (
                <div
                  key={session._id}
                  className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow ${
                    joinState === "expired" ? "opacity-60" : ""
                  }`}
                >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{session.problem}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="size-4" />
                          <span>
                            {session.scheduledAt
                              ? format(new Date(session.scheduledAt), "PPpp")
                              : "Time TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="size-4" />
                          <span>{session.host?.name || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge badge-lg ${
                          session.difficulty === "easy"
                            ? "badge-success"
                            : session.difficulty === "medium"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {session.difficulty}
                      </span>

                      {joinState === "expired" ? (
                        <span className="btn btn-ghost btn-sm gap-1 btn-disabled text-error">
                          <AlertTriangleIcon className="size-4" />
                          Expired
                        </span>
                      ) : joinState === "waiting" ? (
                        <button className="btn btn-outline btn-sm btn-disabled gap-1" disabled>
                          <ClockIcon className="size-4" />
                          Starts{" "}
                          {session.scheduledAt
                            ? format(new Date(session.scheduledAt), "p")
                            : "later"}
                        </button>
                      ) : (
                        <Link
                          to={`/session/${session._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SchedulePage;
