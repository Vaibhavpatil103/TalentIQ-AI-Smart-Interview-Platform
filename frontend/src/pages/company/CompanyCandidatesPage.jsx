import { useState } from "react";
import {
  UsersIcon,
  SearchIcon,
  Loader2Icon,
  CalendarIcon,
  SendIcon,
  XIcon,
  CheckCircleIcon,
  MailIcon,
  GithubIcon,
  FileTextIcon,
  InfoIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyNavbar from "../../components/CompanyNavbar";
import { axiosInstance } from "../../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Shared styles ────────────────────────────────────────────
const inputCls = "input-light w-full transition-all duration-200";
const labelCls = "block text-xs font-semibold text-[var(--light-text-secondary)] uppercase tracking-wider mb-1.5";

// ── Status config ─────────────────────────────────────────────
const STATUS_BADGE = {
  applied:              "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]",
  screening:            "bg-[#fef9c3] text-[#ca8a04] border-[#facc15]",
  shortlisted:          "bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]",
  interview_scheduled:  "bg-[#f3e8ff] text-[#7c3aed] border-[#c4b5fd]",
  interviewed:          "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  offer_sent:           "bg-[#fef9c3] text-[#ca8a04] border-[#facc15]",
  hired:                "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  rejected:             "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]",
};

const ALL_STATUSES = [
  "applied","screening","shortlisted","interview_scheduled",
  "interviewed","offer_sent","hired","rejected",
];

// ── Hooks (existing — unchanged) ──────────────────────────────
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

function useAllMyApplications(jobIds) {
  return useQuery({
    queryKey: ["allApplications", jobIds],
    queryFn: async () => {
      if (!jobIds?.length) return [];
      const results = await Promise.all(
        jobIds.map((id) =>
          axiosInstance
            .get(`/applications/job/${id}`)
            .then((r) => r.data.applications || [])
            .catch(() => [])
        )
      );
      return results
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    enabled: !!jobIds?.length,
  });
}

function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, recruiterNotes }) =>
      axiosInstance.patch(`/applications/${id}/status`, { status, recruiterNotes }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
      qc.invalidateQueries({ queryKey: ["allApplications"] });
    },
    onError: () => toast.error("Failed to update status"),
  });
}

function useAIMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.post(`/applications/${id}/ai-match`),
    onSuccess: () => {
      toast.success("AI match complete!");
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
      qc.invalidateQueries({ queryKey: ["allApplications"] });
    },
    onError: () => toast.error("AI match failed"),
  });
}

function useScheduleInterview(onDone) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt, candidateEmail }) =>
      axiosInstance.post(`/applications/${id}/schedule`, { scheduledAt, candidateEmail }),
    onSuccess: () => {
      toast.success("Interview scheduled! Email sent.");
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
      qc.invalidateQueries({ queryKey: ["allApplications"] });
      onDone?.();
    },
    onError: () => toast.error("Failed to schedule"),
  });
}

function useSendOffer(onDone) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, offeredSalary, message }) =>
      axiosInstance.post(`/applications/${id}/offer`, { offeredSalary, message }),
    onSuccess: () => {
      toast.success("Offer sent!");
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
      qc.invalidateQueries({ queryKey: ["allApplications"] });
      onDone?.();
    },
    onError: () => toast.error("Failed to send offer"),
  });
}

// ── Match score indicator ─────────────────────────────────────
function MatchScore({ score, size = 40 }) {
  const color = score >= 70 ? "#1a7f37" : score >= 40 ? "#9a6700" : "#cf222e";
  const bg = score >= 70 ? "#dafbe1" : score >= 40 ? "#fff8c5" : "#ffebe9";
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold"
      style={{
        backgroundColor: bg,
        color,
        width: size,
        height: size,
        fontSize: size < 48 ? 12 : 16,
      }}
    >
      {score}%
    </div>
  );
}

// ── Mini stat card ────────────────────────────────────────────
function MiniStat({ icon: Icon, iconBg, topColor, label, value }) {
  return (
    <div
      className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex-1"
      style={{ borderTop: `3px solid ${topColor}` }}
    >
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

// ── Modal shell ───────────────────────────────────────────────
function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg mx-4
          shadow-xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] flex-shrink-0">
          <h3 className="font-bold text-[#0f172a] text-lg">{title}</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0f172a]">
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">{children}</div>
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-3 justify-end flex-shrink-0">
          {footer}
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CANDIDATE DETAIL PANEL (slide from right)
// ══════════════════════════════════════════════════════════════
function CandidateDetailPanel({ app, jobs, onClose, onStatusChange, onSchedule, onOffer }) {
  const [localNotes, setLocalNotes] = useState(app?.recruiterNotes || "");
  const { mutate: saveNotes } = useUpdateStatus();

  if (!app) return null;
  const candidate = app.candidateObjectId;
  const job = typeof app.jobId === "object" ? app.jobId : jobs.find((j) => j._id === app.jobId);
  const initials = (candidate?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveNotes = () => {
    saveNotes(
      { id: app._id, status: app.status, recruiterNotes: localNotes },
      { onSuccess: () => toast.success("Notes saved!") }
    );
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a66c2] text-white font-bold text-sm flex items-center justify-center">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[#0f172a]">{candidate?.name || "Unknown"}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE[app.status] || STATUS_BADGE.applied}`}>
                {app.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0f172a]">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Contact */}
          <div>
            <p className={labelCls}>Contact Information</p>
            <div className="space-y-2">
              {candidate?.email && (
                <div className="flex items-center gap-2">
                  <MailIcon className="size-4 text-[#64748b]" />
                  <span className="text-sm text-[#0f172a]">{candidate.email}</span>
                </div>
              )}
              {candidate?.githubUrl && (
                <div className="flex items-center gap-2">
                  <GithubIcon className="size-4 text-[#64748b]" />
                  <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="text-sm text-[#0a66c2] hover:underline">
                    {candidate.githubUrl}
                  </a>
                </div>
              )}
              {candidate?.resumeUrl && (
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-[#64748b]" />
                  <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-[#0a66c2] hover:underline">
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Tech Stack */}
          <div>
            <p className={labelCls}>Tech Stack</p>
            {candidate?.techStack?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.techStack.map((s) => (
                  <span key={s} className="bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] text-xs px-2 py-1 rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94a3b8]">Not specified</p>
            )}
          </div>

          {/* Section 3: Application Info */}
          <div>
            <p className={labelCls}>Application Details</p>
            {[
              { label: "Applied For", value: job?.title || "—" },
              {
                label: "Applied On",
                value: app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—",
              },
              {
                label: "Interview",
                value: app.interviewScheduledAt
                  ? new Date(app.interviewScheduledAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })
                  : "Not scheduled",
              },
              {
                label: "Offer Status",
                value: app.offerSent ? (app.offerStatus || "pending") : "No offer sent",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-[#f6f8fa] last:border-0">
                <span className="text-sm text-[#64748b]">{label}</span>
                <span className="text-sm font-medium text-[#0f172a]">{value}</span>
              </div>
            ))}
          </div>

          {/* Section 4: AI Match */}
          <div>
            <p className={labelCls}>AI Match Analysis</p>
            {app.matchScore > 0 ? (
              <>
                <div className="flex justify-center mb-3">
                  <MatchScore score={app.matchScore} size={64} />
                </div>
                {app.aiSummary && (
                  <p className="text-sm text-[#64748b] leading-relaxed mt-3">{app.aiSummary}</p>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {app.matchedSkills?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold mb-1.5">Matched</p>
                      <div className="flex flex-wrap gap-1">
                        {app.matchedSkills.map((s) => (
                          <span key={s} className="bg-[#dafbe1] text-[#1a7f37] border border-[#56d364] text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.missingSkills?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold mb-1.5">Missing</p>
                      <div className="flex flex-wrap gap-1">
                        {app.missingSkills.map((s) => (
                          <span key={s} className="bg-[#ffebe9] text-[#cf222e] border border-[#ff8182] text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#94a3b8]">AI analysis not run yet</p>
            )}
          </div>

          {/* Section 5: Cover Letter */}
          {app.coverLetter && (
            <div>
              <p className={labelCls}>Cover Letter</p>
              <div className="bg-[#f8fafc] rounded-xl p-4">
                <p className="text-sm text-[#64748b] leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Section 6: Recruiter Notes */}
          <div>
            <p className={labelCls}>Your Notes</p>
            <textarea
              className="bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm w-full min-h-[80px] resize-none outline-none focus:border-[#0a66c2] text-[#0f172a]"
              placeholder="Add private notes about this candidate..."
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
            />
            <button onClick={handleSaveNotes} className="text-xs text-[#0a66c2] hover:underline mt-2">
              Save Notes
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-3 flex-shrink-0 bg-white">
          <select
            className={`text-xs px-2 py-2 rounded-lg border font-medium outline-none cursor-pointer capitalize flex-1 ${STATUS_BADGE[app.status] || STATUS_BADGE.applied}`}
            value={app.status}
            onChange={(e) => onStatusChange(app._id, e.target.value)}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-white text-[#0f172a]">
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSchedule(app)}
            className="flex items-center gap-1.5 bg-[#8250df] hover:bg-[#6e40c9] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <CalendarIcon className="size-4" />
            Schedule
          </button>
          <button
            onClick={() => onOffer(app)}
            disabled={app.offerSent}
            className="flex items-center gap-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <SendIcon className="size-4" />
            Offer
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// SCHEDULE INTERVIEW MODAL
// ══════════════════════════════════════════════════════════════
function ScheduleInterviewModal({ app, onClose }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [candidateEmail, setCandidateEmail] = useState(app?.candidateObjectId?.email || "");
  const { mutate, isPending } = useScheduleInterview(onClose);

  const handleSubmit = () => {
    if (!scheduledAt) { toast.error("Please select a date & time"); return; }
    mutate({ id: app._id, scheduledAt, candidateEmail });
  };

  const candidateName = app?.candidateObjectId?.name || "Candidate";

  return (
    <ModalShell
      title="Schedule Interview"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f8fafc] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#8250df] hover:bg-[#6e40c9] text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <CalendarIcon className="size-4" />}
            Schedule & Send Email
          </button>
        </>
      }
    >
      <p className="text-sm text-[#64748b]">
        for <span className="font-semibold text-[#0f172a]">{candidateName}</span>
      </p>
      <div>
        <label className={labelCls}>Interview Date & Time</label>
        <input type="datetime-local" className={inputCls} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Candidate Email</label>
        <input type="email" className={inputCls} value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
        <p className="text-xs text-[#64748b] mt-1">An invite email will be sent automatically</p>
      </div>
    </ModalShell>
  );
}

// ══════════════════════════════════════════════════════════════
// SEND OFFER MODAL
// ══════════════════════════════════════════════════════════════
function SendOfferModal({ app, onClose }) {
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useSendOffer(onClose);

  const candidate = app?.candidateObjectId;
  const job = typeof app?.jobId === "object" ? app?.jobId : null;
  const initials = (candidate?.name || "?")[0].toUpperCase();

  const handleSubmit = () => {
    if (!salary) { toast.error("Please enter salary amount"); return; }
    mutate({ id: app._id, offeredSalary: Number(salary), message });
  };

  return (
    <ModalShell
      title="Send Offer"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f8fafc] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
            Send Offer
          </button>
        </>
      }
    >
      {/* Candidate card */}
      <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#0a66c2] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-medium text-sm text-[#0f172a]">{candidate?.name}</p>
          <p className="text-xs text-[#64748b]">for {job?.title || "this position"}</p>
        </div>
      </div>

      <div>
        <label className={labelCls}>Offered Salary (Annual)</label>
        <input type="number" className={inputCls} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="85000" />
        <p className="text-xs text-[#64748b] mt-1">in {job?.currency || "USD"}</p>
      </div>

      <div>
        <label className={labelCls}>Offer Message</label>
        <textarea
          className={`${inputCls} min-h-[100px] resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Congratulations! We're pleased to offer you the position of...`}
        />
      </div>

      {/* Warning */}
      <div className="bg-[#fff8c5] border border-[#e3b341] rounded-xl p-3 text-xs text-[#9a6700] flex items-start gap-2">
        <InfoIcon className="size-4 flex-shrink-0 mt-0.5" />
        <span>The candidate will receive this offer in their inbox and can accept, reject, or negotiate.</span>
      </div>
    </ModalShell>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
function CompanyCandidatesPage() {
  const [selectedJob, setSelectedJob] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [offeringApp, setOfferingApp] = useState(null);

  const { data: jobs = [], isLoading: jobsLoading } = useMyJobs();
  const { data: applicationsForJob = [], isLoading: appsLoading } = useApplicationsForJob(selectedJob);

  // All applications across all jobs when no job is selected
  const jobIds = jobs.map((j) => j._id);
  const { data: allApps = [] } = useAllMyApplications(selectedJob ? null : jobIds);

  const applications = selectedJob ? applicationsForJob : allApps;

  const { mutate: updateStatus } = useUpdateStatus();
  const { mutate: runAIMatch, isPending: aiPending } = useAIMatch();

  const filtered = applications.filter((a) => {
    const name = a.candidateObjectId?.name || "";
    const email = a.candidateObjectId?.email || "";
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats from current application list
  const appStats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter(
      (a) => a.status === "interview_scheduled" || a.status === "interviewed"
    ).length,
    offers: applications.filter(
      (a) => a.status === "offer_sent" || a.status === "hired"
    ).length,
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
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 font-medium">
              Candidate Management
            </p>
            <h1 className="text-2xl font-bold text-white">Candidates</h1>
            <p className="text-white/70 text-sm mt-1">
              {applications.length} applicants across {jobs.length} job postings
            </p>
          </div>
          {/* Search styled for dark bg */}
          <div className="relative flex-shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
            <input
              className="bg-white/10 border border-white/25 text-white placeholder-white/50
                rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:bg-white/20 w-64"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── MINI STAT CARDS ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={UsersIcon} iconBg="#ddf4ff" topColor="#0a66c2" label="Total Applicants" value={appStats.total} />
          <MiniStat icon={CheckCircleIcon} iconBg="#dafbe1" topColor="#1a7f37" label="Shortlisted" value={appStats.shortlisted} />
          <MiniStat icon={CalendarIcon} iconBg="#fbefff" topColor="#8250df" label="Interviews Scheduled" value={appStats.interviews} />
          <MiniStat icon={SendIcon} iconBg="#fff8c5" topColor="#bf8700" label="Offers Sent" value={appStats.offers} />
        </div>
      </div>

      {/* ── FILTERS ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <select
            className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] outline-none focus:border-[#0a66c2]"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            {["all", "applied", "shortlisted", "interview_scheduled", "interviewed", "offer_sent", "hired"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-[#0a66c2] text-white border-[#0a66c2]"
                    : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-6"
      >
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0] mb-2">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-3">Applied For</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-center">Match</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {appsLoading || jobsLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 skeleton-light border border-[var(--light-border)]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#e2e8f0] rounded-xl p-16 text-center">
            <UsersIcon className="size-12 text-[#e2e8f0] mx-auto mb-4" />
            <p className="font-semibold text-[#0f172a]">No candidates yet</p>
            <p className="text-sm text-[#64748b] mt-2">Applications will appear here once candidates apply</p>
          </div>
        ) : (
          filtered.map((app) => {
            const candidate = app.candidateObjectId;
            const job = typeof app.jobId === "object" ? app.jobId : jobs.find((j) => j._id === app.jobId);
            const initials = (candidate?.name || "?")[0].toUpperCase();
            return (
              <motion.div
                key={app._id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.1 }}
                className="grid grid-cols-12 gap-4 items-center bg-white border border-[#e2e8f0]
                  rounded-xl px-4 py-4 mb-2 hover:border-[#0a66c2] hover:shadow-sm transition-all"
              >
                {/* Candidate (col 4) */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0a66c2] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#0f172a] truncate">{candidate?.name || "Unknown"}</p>
                    <p className="text-xs text-[#64748b] truncate">{candidate?.email}</p>
                  </div>
                </div>

                {/* Applied For (col 3) */}
                <div className="col-span-3">
                  <p className="text-sm text-[#0f172a] truncate">{job?.title || "—"}</p>
                  <p className="text-xs text-[#64748b]">{job?.company || ""}</p>
                </div>

                {/* Status (col 2) */}
                <div className="col-span-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus({ id: app._id, status: e.target.value })}
                    className={`text-xs px-2 py-1 rounded-full border font-medium outline-none cursor-pointer capitalize w-full ${STATUS_BADGE[app.status] || STATUS_BADGE.applied}`}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-white text-[#0f172a]">
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Match (col 1) */}
                <div className="col-span-1 flex justify-center">
                  {app.matchScore > 0 ? (
                    <MatchScore score={app.matchScore} />
                  ) : (
                    <button
                      onClick={() => runAIMatch(app._id)}
                      disabled={aiPending}
                      className="text-[#0a66c2] text-xs hover:underline disabled:opacity-50 font-medium"
                    >
                      {aiPending ? <Loader2Icon className="size-3 animate-spin" /> : "Run AI"}
                    </button>
                  )}
                </div>

                {/* Actions (col 2) */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-[#0a66c2] text-xs hover:underline font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setSchedulingApp(app)}
                    className="border border-[#e2e8f0] hover:border-[#0a66c2] text-[#64748b] text-xs px-2 py-1 rounded-md transition-colors"
                  >
                    Schedule
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ── PANELS & MODALS ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <CandidateDetailPanel
            app={selectedApp}
            jobs={jobs}
            onClose={() => setSelectedApp(null)}
            onStatusChange={(id, status) => updateStatus({ id, status })}
            onSchedule={(a) => {
              setSelectedApp(null);
              setSchedulingApp(a);
            }}
            onOffer={(a) => {
              setSelectedApp(null);
              setOfferingApp(a);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {schedulingApp && (
          <ScheduleInterviewModal app={schedulingApp} onClose={() => setSchedulingApp(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {offeringApp && (
          <SendOfferModal app={offeringApp} onClose={() => setOfferingApp(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompanyCandidatesPage;
