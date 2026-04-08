import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  BuildingIcon,
  DollarSignIcon,
  CalendarIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  SendIcon,
  XIcon,
  Loader2Icon,
  UsersIcon,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

// ─── Hooks ────────────────────────────────────────────────────
function useJob(id) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${id}`);
      return res.data.job;
    },
    enabled: !!id,
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

function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }) => axiosInstance.post("/applications", { jobId, coverLetter }),
    onSuccess: () => {
      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to apply"),
  });
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
function JobDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = useJob(id);
  const { data: myApplications = [] } = useMyApplications();
  const { mutate: applyToJob, isPending } = useApplyToJob();

  const alreadyApplied = useMemo(
    () => myApplications.some((a) => (typeof a.jobId === "object" ? a.jobId._id : a.jobId) === id),
    [myApplications, id]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl h-60 animate-pulse" />
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl h-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <BriefcaseIcon className="size-12 text-[var(--dark-border)] mx-auto mb-4" />
          <p className="text-[var(--dark-text)] font-semibold">Job not found</p>
          <Link to="/jobs" className="text-[var(--dark-accent)] text-sm hover:underline mt-3 inline-block">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    applyToJob(
      { jobId: id, coverLetter },
      { onSuccess: () => { setShowApplyModal(false); setCoverLetter(""); } }
    );
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)]">
      <Navbar />

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="bg-[var(--dark-card)] border-b border-[var(--dark-border)] py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/jobs" className="flex items-center gap-2 text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] transition-colors text-sm">
            <ArrowLeftIcon className="size-4" />
            Back to Jobs
          </Link>
          <span className="text-sm text-[var(--dark-text-secondary)]">
            Jobs / <span className="text-[var(--dark-text)]">{job.company}</span>
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── HERO CARD ────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Company avatar */}
                <div className="w-14 h-14 rounded-xl bg-[var(--dark-elevated)] border border-[var(--dark-border)] flex items-center justify-center text-xl font-black text-[var(--dark-accent)]">
                  {(job.company || "?")[0].toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold text-[var(--dark-text)] mt-4">{job.title}</h1>
                {/* Meta */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-[var(--dark-text-secondary)]"><BuildingIcon className="size-3" />{job.company}</span>
                  {job.location && <span className="flex items-center gap-1.5 text-sm text-[var(--dark-text-secondary)]"><MapPinIcon className="size-3" />{job.location}</span>}
                  {job.jobType && <span className="flex items-center gap-1.5 text-sm text-[var(--dark-text-secondary)] capitalize"><BriefcaseIcon className="size-3" />{job.jobType}</span>}
                  {job.experienceLevel && <span className="flex items-center gap-1.5 text-sm text-[var(--dark-text-secondary)] capitalize"><TrendingUpIcon className="size-3" />{job.experienceLevel}</span>}
                  {job.salaryMin && job.salaryMax && (
                    <span className="flex items-center gap-1.5 text-sm text-[var(--dark-text-secondary)]">
                      <DollarSignIcon className="size-3" />
                      {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()} {job.currency || "USD"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                {alreadyApplied ? (
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                    style={{ background: "var(--color-success-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" }}
                  >
                    <CheckCircleIcon className="size-4" />
                    Application Submitted
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowApplyModal(true)}
                    className="bg-[var(--dark-accent)] hover:bg-[var(--dark-accent-hover)] text-white font-bold rounded-lg px-6 py-2.5 text-sm transition-colors flex items-center gap-2"
                  >
                    <SendIcon className="size-4" />
                    Apply Now
                  </motion.button>
                )}
                {job.deadline && (
                  <span className="text-xs text-[var(--dark-text-secondary)] flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    Closes {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <>
                <div className="border-t border-[var(--dark-border)] my-5" />
                <p className="text-xs text-[var(--dark-text-secondary)] uppercase tracking-wider mb-3 font-semibold">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="bg-[var(--dark-elevated)] text-[var(--dark-text)] border border-[var(--dark-border)] text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {job.description && (
                <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
                  <p className="text-xs uppercase tracking-wider text-[var(--dark-text-secondary)] font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--dark-accent)]" />
                    Job Description
                  </p>
                  <div className="text-sm text-[var(--dark-text-secondary)] leading-relaxed whitespace-pre-wrap">{job.description}</div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
                  <p className="text-xs uppercase tracking-wider text-[var(--dark-text-secondary)] font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--dark-accent)]" />
                    Requirements
                  </p>
                  <ul className="space-y-3">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircleIcon className="size-4 text-[var(--dark-accent)] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[var(--dark-text-secondary)]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-5">
              {/* Job summary */}
              <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-[var(--dark-text-secondary)] font-semibold mb-4">Job Details</p>
                {[
                  { label: "Company", value: job.company },
                  { label: "Location", value: job.location || "Remote" },
                  { label: "Type", value: job.jobType, capitalize: true },
                  { label: "Experience", value: job.experienceLevel, capitalize: true },
                  { label: "Posted", value: new Date(job.createdAt).toLocaleDateString() },
                ].map(({ label, value, capitalize }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-[var(--dark-elevated)] last:border-0">
                    <span className="text-sm text-[var(--dark-text-secondary)]">{label}</span>
                    <span className={`text-sm font-medium text-[var(--dark-text)] ${capitalize ? "capitalize" : ""}`}>{value || "—"}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-[var(--dark-text-secondary)]">Applicants</span>
                  <span className="text-sm font-semibold text-[var(--dark-accent)]">{job.applicantCount || 0} applied</span>
                </div>
              </div>

              {/* Apply card */}
              <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
                {alreadyApplied ? (
                  <>
                    <CheckCircleIcon className="size-8 text-[var(--dark-accent)] mx-auto mb-3" />
                    <p className="font-bold text-[var(--dark-text)]">You've Applied!</p>
                    <p className="text-xs text-[var(--dark-text-secondary)] mt-2">Track your application status in My Applications</p>
                    <Link to="/my-applications" className="text-[var(--dark-accent)] text-sm hover:underline mt-3 block">
                      View Application →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[var(--dark-text)]">Ready to apply?</p>
                    <p className="text-xs text-[var(--dark-text-secondary)] mt-1 mb-4">Submit your application and let the recruiter know you're interested</p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowApplyModal(true)}
                      className="w-full bg-[var(--dark-accent)] hover:bg-[var(--dark-accent-hover)] text-white font-bold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <SendIcon className="size-4" />
                      Apply Now
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── APPLY MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowApplyModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl mx-4 z-10"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[var(--dark-text)] text-lg">Apply for {job.title}</h3>
                <button onClick={() => setShowApplyModal(false)} className="text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)]">
                  <XIcon className="size-5" />
                </button>
              </div>
              <p className="text-sm text-[var(--dark-text-secondary)] mb-4">{job.company}</p>

              {/* Your profile */}
              <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-xl p-4">
                <p className="text-xs text-[var(--dark-text-secondary)] uppercase tracking-wider mb-2">Your Profile</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--dark-accent)] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {(user?.firstName || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--dark-text)]">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-[var(--dark-text-secondary)]">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
              </div>

              {/* Cover letter */}
              <div className="mt-5">
                <label className="block text-xs font-semibold text-[var(--dark-text-secondary)] uppercase tracking-wider mb-1.5">
                  Cover Letter (optional)
                </label>
                <textarea
                  className="input-dark w-full min-h-[100px] resize-none"
                  placeholder="Tell the recruiter why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <button
                onClick={handleApply}
                disabled={isPending}
                className="w-full bg-[var(--dark-accent)] hover:bg-[var(--dark-accent-hover)] text-white font-bold rounded-lg py-3 text-sm transition-colors mt-5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                Submit Application
              </button>

              <button
                onClick={() => setShowApplyModal(false)}
                className="text-[var(--dark-text-secondary)] text-sm hover:text-[var(--dark-text)] text-center mt-3 block w-full"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default JobDetailPage;
