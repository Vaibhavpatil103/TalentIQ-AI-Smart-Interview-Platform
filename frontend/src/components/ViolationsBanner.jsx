import { AlertTriangleIcon } from "lucide-react";

/**
 * Interviewer-facing alert banner.
 * Shows a dark-themed alert when the candidate switches tabs.
 */
function ViolationsBanner({ count }) {
  if (!count || count === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg mt-3 animate-pulse"
      style={{ backgroundColor: "#111827", border: "1px solid #EF4444" }}
    >
      <AlertTriangleIcon className="size-5 shrink-0" style={{ color: "#EF4444" }} />
      <p className="text-sm font-medium" style={{ color: "#F59E0B" }}>
        🚨 Candidate switched tabs —{" "}
        <span className="font-bold text-lg" style={{ color: "#EF4444" }}>
          {count}
        </span>{" "}
        {count === 1 ? "time" : "times"} total
      </p>
    </div>
  );
}

export default ViolationsBanner;
