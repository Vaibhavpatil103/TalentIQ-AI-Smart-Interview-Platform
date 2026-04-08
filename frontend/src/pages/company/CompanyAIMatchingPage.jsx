import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import CompanyNavbar from "../../components/CompanyNavbar";
import {
  SparklesIcon,
  BriefcaseIcon,
  UsersIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon,
  ZapIcon,
  AlertCircleIcon,
} from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────
const STATUS_BADGE = {
  applied:             "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
  screening:           "bg-[#fef9c3] text-[#ca8a04] border-[#e3b341]",
  shortlisted:         "bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]",
  interview_scheduled: "bg-[#f3e8ff] text-[#7c3aed] border-[#c4b5fd]",
  interviewed:         "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  offer_sent:          "bg-[#fef9c3] text-[#ca8a04] border-[#e3b341]",
  hired:               "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  rejected:            "bg-[#fee2e2] text-[#dc2626] border-[#ff8182]",
};

// ─── Hooks ────────────────────────────────────────────────────
function useMyJobs() {
  return useQuery({
    queryKey: ["myJobs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/jobs");
      return res.data.jobs || [];
    },
  });
}

function useApplicationsForJob(jobId) {
  return useQuery({
    queryKey: ["applicationsForJob", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const res = await axiosInstance.get(`/applications/job/${jobId}`);
      return res.data.applications || [];
    },
    enabled: !!jobId,
  });
}

function useAIMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.post(`/applications/${id}/ai-match`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
    },
    onError: () => toast.error("AI match failed"),
  });
}

// ─── MatchScoreRing (SVG) ─────────────────────────────────────
function MatchScoreRing({ score, size = 56 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#bf8700" : "#dc2626";
  const bg = score >= 70 ? "#dcfce7" : score >= 40 ? "#fef9c3" : "#fee2e2";

  return (
    <div
      className="relative flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <svg
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
        width={size}
        height={size}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f6f8fa" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{ fontSize: size > 48 ? 14 : 11, fontWeight: 700, color }}>{score}%</span>
    </div>
  );
}

// ─── Mini stat card ───────────────────────────────────────────
function MiniStat({ icon: Icon, iconBg, topColor, label, value }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex-1" style={{ borderTop: `3px solid ${topColor}` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="size-4" style={{ color: topColor }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
      <p className="text-xs text-[#64748b] mt-1">{label}</p>
    </div>
  );
}

// ─── Score filter pills ───────────────────────────────────────
const SCORE_FILTERS = [
  { key: "all", label: "All" },
  { key: "high", label: "High (70%+)" },
  { key: "medium", label: "Medium (40-69%)" },
  { key: "low", label: "Low (<40%)" },
  { key: "unanalyzed", label: "Unanalyzed" },
];

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
function CompanyAIMatchingPage() {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [bulkRunning, setBulkRunning] = useState(false);

  const { data: jobs = [] } = useMyJobs();
  const { data: applications = [], isLoading } = useApplicationsForJob(selectedJobId);
  const { mutateAsync: runAIMatchAsync, mutate: runAIMatch, isPending: aiPending } = useAIMatch();

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // Derived stats
  const analyzed = applications.filter((a) => a.matchScore > 0).length;
  const highMatch = applications.filter((a) => a.matchScore >= 70).length;
  const medMatch = applications.filter((a) => a.matchScore >= 40 && a.matchScore < 70).length;
  const lowMatch = applications.filter((a) => a.matchScore > 0 && a.matchScore < 40).length;

  // Filter
  const filtered = applications.filter((a) => {
    if (scoreFilter === "all") return true;
    if (scoreFilter === "high") return a.matchScore >= 70;
    if (scoreFilter === "medium") return a.matchScore >= 40 && a.matchScore < 70;
    if (scoreFilter === "low") return a.matchScore > 0 && a.matchScore < 40;
    if (scoreFilter === "unanalyzed") return !a.matchScore || a.matchScore === 0;
    return true;
  });

  // Sort by score desc
  const sorted = [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // Bulk run
  const handleBulkRun = async () => {
    const unanalyzed = applications.filter((a) => !a.matchScore || a.matchScore === 0);
    if (unanalyzed.length === 0) { toast("All candidates already analyzed"); return; }
    setBulkRunning(true);
    toast.success(`Running AI on ${unanalyzed.length} candidates...`);
    for (const app of unanalyzed) {
      try {
        await runAIMatchAsync(app._id);
      } catch { /* handled by hook */ }
      await new Promise((r) => setTimeout(r, 500));
    }
    setBulkRunning(false);
    toast.success("Bulk AI analysis complete!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CompanyNavbar />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-8 px-6"
        style={{ background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

        <div className="max-w-7xl mx-auto flex items-start justify-between relative z-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="size-4 text-white/70" />
              <p className="text-white/70 text-xs uppercase tracking-widest font-medium">AI Matching</p>
            </div>
            <h1 className="text-2xl font-bold text-white">AI Resume Matching</h1>
            <p className="text-white/70 text-sm mt-1">Rank candidates by job fit using AI analysis</p>
          </div>

          {/* Job selector */}
          <div className="flex-shrink-0">
            <p className="text-white/70 text-xs mb-1">Analyzing for:</p>
            <select
              className="bg-white/10 border border-white/25 text-white rounded-lg px-3 py-2 text-sm outline-none focus:bg-white/20 min-w-[200px]"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="" className="text-[#0f172a]">Select a job...</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id} className="text-[#0f172a]">{j.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={UsersIcon} iconBg="#ddf4ff" topColor="#0a66c2" label="Total Candidates" value={applications.length} />
          <MiniStat icon={SparklesIcon} iconBg="#f3e8ff" topColor="#7c3aed" label="Analyzed" value={analyzed} />
          <MiniStat icon={CheckCircleIcon} iconBg="#dcfce7" topColor="#16a34a" label="High Match (70%+)" value={highMatch} />
          <MiniStat icon={AlertCircleIcon} iconBg="#fee2e2" topColor="#dc2626" label="Needs Review (<40%)" value={lowMatch} />
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 pb-16"
      >
        {!selectedJobId ? (
          <div className="bg-white border-2 border-dashed border-[#e2e8f0] rounded-xl p-16 text-center mt-2">
            <SparklesIcon className="size-12 text-[#e2e8f0] mx-auto mb-4" />
            <p className="font-semibold text-[#0f172a]">Select a job to start AI matching</p>
            <p className="text-sm text-[#64748b] mt-2">Choose a job posting above to rank candidates by AI match score</p>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 mt-2 flex-wrap gap-4">
              <div>
                <p className="text-sm text-[#64748b]">
                  {applications.length} candidates for <span className="font-semibold text-[#0f172a]">{selectedJob?.title}</span>
                </p>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  {analyzed} analyzed · {applications.length - analyzed} pending
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2">
                  {SCORE_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setScoreFilter(f.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        scoreFilter === f.key
                          ? "bg-[#0a66c2] text-white border-[#0a66c2]"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleBulkRun}
                  disabled={bulkRunning || applications.length - analyzed === 0}
                  className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6e40c9] text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {bulkRunning ? <Loader2Icon className="size-4 animate-spin" /> : <ZapIcon className="size-4" />}
                  Run AI on All
                </button>
              </div>
            </div>

            {/* Candidates list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] h-28 animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#e2e8f0] rounded-xl p-16 text-center">
                <UsersIcon className="size-12 text-[#e2e8f0] mx-auto mb-4" />
                <p className="font-semibold text-[#0f172a]">No candidates match this filter</p>
                <p className="text-sm text-[#64748b] mt-2">Try a different filter or run AI analysis first</p>
              </div>
            ) : (
              sorted.map((app, idx) => {
                const candidate = app.candidateObjectId;
                const initials = (candidate?.name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const rank = idx + 1;
                const hasScore = app.matchScore > 0;

                return (
                  <motion.div
                    key={app._id}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.1 }}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-3 hover:border-[#0a66c2] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-5">
                      {/* Rank + Score */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-lg font-black w-8 text-center ${rank <= 3 ? "text-[#0a66c2]" : "text-[#e2e8f0]"}`}>
                          #{rank}
                        </span>
                        {hasScore ? (
                          <MatchScoreRing score={app.matchScore} size={56} />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] flex items-center justify-center">
                            <span className="text-[10px] text-[#94a3b8] text-center leading-tight">Not<br />analyzed</span>
                          </div>
                        )}
                      </div>

                      {/* Center — candidate info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#0f172a]">{candidate?.name || "Unknown"}</p>
                            <p className="text-sm text-[#64748b] mt-0.5">{candidate?.email || ""}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${STATUS_BADGE[app.status] || STATUS_BADGE.applied}`}>
                            {app.status?.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Tech stack */}
                        {candidate?.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.techStack.slice(0, 6).map((s) => (
                              <span key={s} className="bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] text-xs px-2 py-0.5 rounded-md">{s}</span>
                            ))}
                            {candidate.techStack.length > 6 && (
                              <span className="text-xs text-[#94a3b8]">+{candidate.techStack.length - 6} more</span>
                            )}
                          </div>
                        )}

                        {/* AI results */}
                        {hasScore && (
                          <>
                            {app.aiSummary && (
                              <p className="text-sm text-[#64748b] leading-relaxed mt-2 italic">{app.aiSummary}</p>
                            )}
                            <div className="flex gap-6 mt-3">
                              {app.matchedSkills?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-[#16a34a] mb-1.5 flex items-center gap-1">
                                    <CheckCircleIcon className="size-3" /> Matched
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.matchedSkills.map((s) => (
                                      <span key={s} className="bg-[#dcfce7] text-[#16a34a] border border-[#86efac] text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {app.missingSkills?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-[#dc2626] mb-1.5 flex items-center gap-1">
                                    <XCircleIcon className="size-3" /> Missing
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.missingSkills.map((s) => (
                                      <span key={s} className="bg-[#fee2e2] text-[#dc2626] border border-[#ff8182] text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right — actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {!hasScore ? (
                          <button
                            onClick={() => runAIMatch(app._id)}
                            disabled={aiPending || bulkRunning}
                            className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6e40c9] text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {aiPending ? <Loader2Icon className="size-3 animate-spin" /> : <SparklesIcon className="size-3" />}
                            Run AI
                          </button>
                        ) : (
                          <button
                            onClick={() => runAIMatch(app._id)}
                            disabled={aiPending || bulkRunning}
                            className="text-xs text-[#94a3b8] hover:text-[#7c3aed] disabled:opacity-50"
                          >
                            Re-analyze
                          </button>
                        )}
                        <Link to="/company/candidates" className="text-[#0a66c2] text-xs hover:underline font-medium">
                          View Candidate →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default CompanyAIMatchingPage;
