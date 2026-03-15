import { useEffect, useState } from "react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { SparklesIcon } from "lucide-react";

/**
 * ProblemDescription — displays the active problem's details.
 * Listens for `problem:pushed` socket events to update in real-time.
 * Shows a "New problem loaded" indicator for 3 seconds on change.
 */
function ProblemDescription({ problem, socket }) {
  const [showNewIndicator, setShowNewIndicator] = useState(false);

  // Show "new problem" indicator when problem changes via socket
  useEffect(() => {
    if (!socket) return;

    const handleProblemPushed = () => {
      setShowNewIndicator(true);
      setTimeout(() => setShowNewIndicator(false), 3000);
    };

    socket.on("problem:pushed", handleProblemPushed);
    return () => socket.off("problem:pushed", handleProblemPushed);
  }, [socket]);

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center bg-base-200">
        <div className="text-center space-y-3 p-8">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#052e16" }}
          >
            <SparklesIcon className="size-8" style={{ color: "#22C55E" }} />
          </div>
          <h3 className="text-lg font-bold text-base-content">No Problem Selected</h3>
          <p className="text-sm text-base-content/60 max-w-xs">
            The interviewer hasn't pushed a problem yet. It will appear here when selected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-base-200">
      {/* HEADER SECTION */}
      <div className="p-6 bg-base-100 border-b border-base-300">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold text-base-content">{problem.title}</h1>
          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        {problem.category && (
          <p className="text-base-content/60">{problem.category}</p>
        )}

        {/* New problem indicator */}
        {showNewIndicator && (
          <div
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm font-medium animate-pulse"
            style={{ backgroundColor: "#052e16", color: "#22C55E" }}
          >
            <SparklesIcon className="size-4" />
            New problem loaded
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* PROBLEM DESC */}
        {problem.description && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold text-base-content">Description</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p className="text-base-content/90">{problem.description.text}</p>
              {problem.description.notes?.map((note, idx) => (
                <p key={idx} className="text-base-content/90">
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* EXAMPLES SECTION */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
            <div className="space-y-4">
              {problem.examples.map((example, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-sm">{idx + 1}</span>
                    <p className="font-semibold text-base-content">Example {idx + 1}</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold min-w-[70px]">Input:</span>
                      <span>{example.input}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                      <span>{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="pt-2 border-t border-base-300 mt-2">
                        <span className="text-base-content/60 font-sans text-xs">
                          <span className="font-semibold">Explanation:</span> {example.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONSTRAINTS */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
            <ul className="space-y-2 text-base-content/90">
              {problem.constraints.map((constraint, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <code className="text-sm">{constraint}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDescription;
