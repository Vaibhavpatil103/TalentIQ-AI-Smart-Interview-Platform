import { ShieldAlertIcon } from "lucide-react";

/**
 * Candidate-facing warning banner.
 * Shows a dark-themed warning that tab switching is being monitored.
 */
function TabViolationAlert({ count }) {
  if (!count || count === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg mt-3 animate-pulse"
      style={{ backgroundColor: "#111827", border: "1px solid #22C55E" }}
    >
      <ShieldAlertIcon className="size-5 shrink-0" style={{ color: "#22C55E" }} />
      <p className="text-sm font-medium" style={{ color: "#22C55E" }}>
        ⚠ Tab switching is monitored. You have switched{" "}
        <span className="font-bold text-lg">{count}</span>{" "}
        {count === 1 ? "time" : "times"}.
      </p>
    </div>
  );
}

export default TabViolationAlert;
