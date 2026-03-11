import { useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import ProblemFilters from "../components/ProblemFilters";
import { useProblems } from "../hooks/useProblems";
import { ChevronRightIcon, Code2Icon, Loader2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [filters, setFilters] = useState({ search: "", difficulty: "", tag: "" });
  const { data, isLoading } = useProblems(filters);
  const problems = data?.problems || [];

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* FILTERS */}
        <div className="mb-6">
          <ProblemFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* PROBLEMS LIST */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="size-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((problem) => (
              <Link
                key={problem._id}
                to={`/problem/${problem._id}`}
                className="card bg-base-100 hover:scale-[1.01] transition-transform"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between gap-4">
                    {/* LEFT SIDE */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Code2Icon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">{problem.title}</h2>
                            <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-base-content/60">{problem.category}</p>
                        </div>
                      </div>
                      <p className="text-base-content/80 mb-3">{problem.description?.text}</p>
                      {problem.tags?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {problem.tags.map((tag) => (
                            <span key={tag} className="badge badge-ghost badge-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-medium">Solve</span>
                      <ChevronRightIcon className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {problems.length === 0 && (
              <div className="text-center py-12 text-base-content/60">
                No problems found matching your filters
              </div>
            )}
          </div>
        )}

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{easyProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{mediumProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
