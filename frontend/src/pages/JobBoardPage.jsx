import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import Navbar from "../components/Navbar";
import {
  BriefcaseIcon,
  MapPinIcon,
  SearchIcon,
  BuildingIcon,
  DollarSignIcon,
  CalendarIcon,
  TrendingUpIcon,
  ChevronRightIcon,
} from "lucide-react";

// ─── Hooks ────────────────────────────────────────────────────
function usePublishedJobs(filters) {
  return useQuery({
    queryKey: ["publishedJobs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.jobType && filters.jobType !== "all") params.set("jobType", filters.jobType);
      if (filters.experienceLevel && filters.experienceLevel !== "all") params.set("experienceLevel", filters.experienceLevel);
      const res = await axiosInstance.get(`/jobs/published?${params.toString()}`);
      return res.data.jobs || [];
    },
  });
}

function useMyApplications() {
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/applications/my");
      return res.data.applications || [];
    },
  });
}

// ─── Constants ────────────────────────────────────────────────
const JOB_TYPES = ["all", "Full-time", "Part-time", "Contract", "Internship"];
const EXP_LEVELS = ["all", "Entry", "Mid", "Senior", "Lead"];

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
function JobBoardPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");

  const filters = useMemo(() => ({ search, jobType, experienceLevel }), [search, jobType, experienceLevel]);
  const { data: jobs = [], isLoading } = usePublishedJobs(filters);
  const { data: myApplications = [] } = useMyApplications();

  const appliedJobIds = useMemo(
    () => new Set(myApplications.map((a) => (typeof a.jobId === "object" ? a.jobId._id : a.jobId))),
    [myApplications]
  );

  return (
    <div className="min-h-screen bg-[var(--light-bg)]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="bg-[var(--light-card)] border-b border-[var(--light-border)] py-12 px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--light-accent)] font-semibold mb-4">
          Talent IQ Job Board
        </p>
        <h1 className="text-4xl font-black text-[var(--light-text)]">Find Your Next Role</h1>
        <p className="text-[var(--light-text-secondary)] text-base mt-2">
          Browse {jobs.length} open positions from top companies
        </p>

        {/* Search bar */}
        <div className="mt-8 max-w-2xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--light-text-tertiary)]" />
            <input
              className="bg-[var(--light-bg)] border border-[var(--light-border)] text-[var(--light-text)] rounded-lg pl-10 pr-3 py-2.5 text-sm w-full outline-none placeholder-[var(--light-text-tertiary)] focus:border-[var(--light-accent)] focus:ring-1 focus:ring-[var(--light-accent-ring)] transition-colors"
              placeholder="Search jobs, skills, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-[var(--light-accent)] hover:bg-[var(--light-accent-hover)] text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors flex-shrink-0">
            Search
          </button>
        </div>
      </div>

      {/* ── FILTERS ──────────────────────────────────────────── */}
      <div className="bg-[var(--light-card)] border-b border-[var(--light-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <span className="text-xs text-[var(--light-text-secondary)] uppercase tracking-wider font-semibold">Filters:</span>

          {/* Job type pills */}
          <div className="flex gap-2">
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setJobType(t)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  jobType === t
                    ? "bg-[var(--light-accent)] text-white border-[var(--light-accent)] font-semibold"
                    : "bg-transparent text-[var(--light-text-secondary)] border-[var(--light-border)] hover:text-[var(--light-text)] hover:border-[var(--light-text-tertiary)]"
                }`}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-[var(--light-border)]" />

          {/* Experience pills */}
          <div className="flex gap-2">
            {EXP_LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setExperienceLevel(l)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  experienceLevel === l
                    ? "bg-[#0a66c2] text-white border-[#0a66c2] font-semibold"
                    : "bg-transparent text-[#64748b] border-[#e2e8f0] hover:text-[#0f172a] hover:border-[#e6edf3]"
                }`}
              >
                {l === "all" ? "All Levels" : l}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-[var(--light-text-secondary)]">{jobs.length} jobs found</span>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--light-card)] border border-[var(--light-border)] rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <BriefcaseIcon className="size-12 text-[var(--light-border)] mx-auto mb-4" />
            <p className="text-[var(--light-text)] font-semibold">No jobs found</p>
            <p className="text-[var(--light-text-secondary)] text-sm mt-2">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const hasApplied = appliedJobIds.has(job._id);
              return (
                <Link key={job._id} to={`/jobs/${job._id}`} className="block">
                  <motion.div
                    whileHover={{ y: -2, borderColor: "rgba(0,0,0,0.3)" }}
                    transition={{ duration: 0.15 }}
                    className="bg-[var(--light-card)] border border-[var(--light-border)] rounded-xl p-5 cursor-pointer transition-all h-full flex flex-col"
                  >
                    {/* Top */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg bg-[var(--light-elevated)] border border-[var(--light-border)] flex items-center justify-center text-sm font-bold text-[var(--light-accent)]"
                        >
                          {(job.company || "?")[0].toUpperCase()}
                        </div>
                        <p className="font-semibold text-[var(--light-text)] text-base mt-3">{job.title}</p>
                        <div className="flex items-center gap-3 text-sm text-[var(--light-text-secondary)] mt-1">
                          <span className="flex items-center gap-1"><BuildingIcon className="size-3" />{job.company}</span>
                          {job.location && <span className="flex items-center gap-1"><MapPinIcon className="size-3" />{job.location}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                        {job.jobType && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full capitalize font-medium"
                            style={{ background: "var(--color-info-bg)", color: "var(--color-info)", border: "1px solid var(--color-info-border)" }}
                          >
                            {job.jobType}
                          </span>
                        )}
                        {hasApplied && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "var(--light-accent-bg)", color: "var(--light-accent)", border: "1px solid var(--light-accent-ring)" }}
                          >
                            Applied ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.slice(0, 4).map((s) => (
                          <span key={s} className="bg-[var(--light-elevated)] text-[var(--light-text-secondary)] border border-[var(--light-border)] text-xs px-2 py-0.5 rounded-md">{s}</span>
                        ))}
                        {job.skills.length > 4 && <span className="text-xs text-[var(--light-text-tertiary)]">+{job.skills.length - 4} more</span>}
                      </div>
                    )}

                    {/* Bottom */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--light-border)]" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                      <div className="flex items-center gap-4 text-xs text-[var(--light-text-secondary)]">
                        {job.salaryMin && job.salaryMax && (
                          <span className="flex items-center gap-1">
                            <DollarSignIcon className="size-3" />
                            {Math.round(job.salaryMin / 1000)}k–{Math.round(job.salaryMax / 1000)}k {job.currency || "USD"}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="flex items-center gap-1 capitalize">
                            <TrendingUpIcon className="size-3" />{job.experienceLevel}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            Closes {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-[var(--light-accent)] text-xs font-medium">
                        View Job <ChevronRightIcon className="size-4" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default JobBoardPage;
