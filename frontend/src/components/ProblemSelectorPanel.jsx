import { useState } from "react";
import { useProblems } from "../hooks/useProblems";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {
  SearchIcon,
  SendIcon,
  Loader2Icon,
  CheckCircleIcon,
  FilterIcon,
} from "lucide-react";

/**
 * ProblemSelectorPanel — interviewer-only panel to search, filter,
 * and push/change problems to the candidate in real-time.
 */
function ProblemSelectorPanel({ sessionId, activeProblemId }) {
  const { data, isLoading } = useProblems();
  const problems = data?.problems || [];

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [pushing, setPushing] = useState(null); // tracks which problemId is being pushed

  const filtered = problems.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handlePush = async (problemId) => {
    setPushing(problemId);
    try {
      await axiosInstance.patch(`/sessions/${sessionId}/problem`, { problemId });
      toast.success("Problem pushed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to push problem");
    } finally {
      setPushing(null);
    }
  };

  return (
    <div
      className="rounded-xl p-4 border space-y-4"
      style={{ backgroundColor: "#111827", borderColor: "#1F2937" }}
    >
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#22C55E" }}>
        Problem Selector
      </h3>

      {/* Search */}
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
          style={{ color: "#6B7280" }}
        />
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border focus:border-green-500"
          style={{
            backgroundColor: "#1F2937",
            borderColor: "#374151",
            color: "#F9FAFB",
          }}
        />
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2">
        <FilterIcon className="size-4 mt-1 shrink-0" style={{ color: "#6B7280" }} />
        {["all", "easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize"
            style={{
              backgroundColor:
                difficultyFilter === level ? "#22C55E" : "#1F2937",
              color: difficultyFilter === level ? "#FFFFFF" : "#9CA3AF",
              border: `1px solid ${difficultyFilter === level ? "#22C55E" : "#374151"
                }`,
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Problem List */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2Icon className="size-5 animate-spin" style={{ color: "#22C55E" }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "#6B7280" }}>
            No problems found
          </p>
        ) : (
          filtered.map((p) => {
            const isActive = p._id === activeProblemId;
            return (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: isActive ? "#052e16" : "#1F2937",
                  borderColor: isActive ? "#22C55E" : "#374151",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "#F9FAFB" }}
                  >
                    {p.title}
                  </p>
                  <p className="text-xs capitalize" style={{ color: "#6B7280" }}>
                    {p.difficulty}
                    {p.category ? ` · ${p.category}` : ""}
                  </p>
                </div>

                {isActive ? (
                  <CheckCircleIcon className="size-5 shrink-0" style={{ color: "#22C55E" }} />
                ) : (
                  <button
                    onClick={() => handlePush(p._id)}
                    disabled={pushing === p._id}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: "#22C55E",
                      color: "#FFFFFF",
                    }}
                  >
                    {pushing === p._id ? (
                      <Loader2Icon className="size-3 animate-spin" />
                    ) : (
                      <SendIcon className="size-3" />
                    )}
                    Push
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProblemSelectorPanel;
