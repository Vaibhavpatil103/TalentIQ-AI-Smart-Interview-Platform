import { AlertTriangleIcon } from "lucide-react";

function TabViolationAlert({ count }) {
  if (!count || count === 0) return null;

  return (
    <div className="alert alert-warning shadow-lg animate-pulse">
      <AlertTriangleIcon className="size-5" />
      <div>
        <h3 className="font-bold text-sm">Tab Switch Detected!</h3>
        <p className="text-xs">
          Candidate has switched tabs{" "}
          <span className="font-bold text-lg">{count}</span>{" "}
          {count === 1 ? "time" : "times"}
        </p>
      </div>
    </div>
  );
}

export default TabViolationAlert;
