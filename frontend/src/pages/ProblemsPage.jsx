import { useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { useProblems } from "../hooks/useProblems";
import { InboxIcon, SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ProblemsPage() {
  const [filters, setFilters] = useState({ search: "", difficulty: "", tag: "" });
  const { data, isLoading } = useProblems(filters);
  const problems = data?.problems || [];

  const getDifficultyBadgeClass = (diff) => {
    if (!diff) return "badge-easy";
    const d = diff.toLowerCase();
    if (d === "hard") return "badge-hard";
    if (d === "medium") return "badge-medium";
    return "badge-easy";
  };

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto pb-12"
      >
        {/* TOP BAR */}
        <div className="flex justify-between items-center py-6 px-6 border-b border-[#30363d]">
          <h1 className="text-xl font-bold text-[#e6edf3]">Problems</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7d8590]" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-dark w-64 pl-9 py-2 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* FILTER ROW */}
        <div className="flex gap-2 px-6 py-4 border-b border-[#30363d]">
          {difficulties.map((diff) => {
            const isActive = filters.difficulty === (diff === "All" ? "" : diff);
            return (
              <button
                key={diff}
                onClick={() => setFilters({ ...filters, difficulty: diff === "All" ? "" : diff })}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  isActive
                    ? "bg-[#2cbe4e20] text-[#2cbe4e] border border-[#2cbe4e40]"
                    : "text-[#7d8590] border border-[#30363d] hover:text-[#e6edf3]"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>

        {/* PROBLEMS ROW */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col">
               {Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="py-4 px-6 border-b border-[#30363d]">
                   <div className="skeleton-line h-6 w-1/3 mb-2" />
                   <div className="skeleton-line h-4 w-1/4" />
                 </div>
               ))}
            </div>
          ) : problems.length > 0 ? (
            <div className="flex flex-col border-b border-[#30363d]">
              {problems.map((problem) => (
                <Link
                  key={problem._id}
                  to={`/problem/${problem._id}`}
                  className="group flex items-center justify-between py-4 px-6 border-b border-[#30363d] last:border-0 hover:bg-[#161b22] transition-colors cursor-pointer"
                >
                  <div>
                    <h2 className="font-medium text-[#e6edf3]">{problem.title}</h2>
                    <p className="text-sm text-[#7d8590] mt-0.5">{problem.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={getDifficultyBadgeClass(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                    <button className="btn-green py-1 px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Solve
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <InboxIcon className="size-10 text-[#484f58] mb-4" />
              <p className="text-[#7d8590]">No challenges matched your filters.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ProblemsPage;
