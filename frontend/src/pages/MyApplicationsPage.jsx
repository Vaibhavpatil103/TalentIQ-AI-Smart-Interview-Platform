import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import Navbar from "../components/Navbar";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  BriefcaseIcon,
  MapPinIcon,
  BuildingIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  SendIcon,
  DollarSignIcon,
  InboxIcon,
} from "lucide-react";

// ─── Hooks ────────────────────────────────────────────────────
function useMyApplications() {
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/applications/my");
      return res.data.applications || [];
    },
  });
}

function useRespondToOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }) => axiosInstance.patch(`/applications/${id}/offer-response`, { response }),
    onSuccess: (_, { response }) => {
      toast.success(response === "accepted" ? "Offer accepted! 🎉" : "Offer declined");
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
    onError: () => toast.error("Failed to respond to offer"),
  });
}

// ─── Status config ────────────────────────────────────────────
const APP_STATUS = {
  applied: { label: "Applied", color: "#7d8590", bg: "rgba(125,133,144,0.1)", border: "rgba(125,133,144,0.2)", icon: SendIcon },
  screening: { label: "Screening", color: "#d29922", bg: "rgba(210,153,34,0.1)", border: "rgba(210,153,34,0.2)", icon: ClockIcon },
  shortlisted: { label: "Shortlisted", color: "#388bfd", bg: "rgba(56,139,253,0.1)", border: "rgba(56,139,253,0.2)", icon: CheckCircleIcon },
  interview_scheduled: { label: "Interview Scheduled", color: "#8250df", bg: "rgba(130,80,223,0.1)", border: "rgba(130,80,223,0.2)", icon: CalendarIcon },
  interviewed: { label: "Interviewed", color: "#2cbe4e", bg: "rgba(44,190,78,0.1)", border: "rgba(44,190,78,0.2)", icon: CheckCircleIcon },
  offer_sent: { label: "Offer Received!", color: "#2cbe4e", bg: "rgba(44,190,78,0.12)", border: "rgba(44,190,78,0.3)", icon: CheckCircleIcon },
  hired: { label: "Hired! 🎉", color: "#2cbe4e", bg: "rgba(44,190,78,0.15)", border: "rgba(44,190,78,0.4)", icon: CheckCircleIcon },
  rejected: { label: "Not Selected", color: "#f85149", bg: "rgba(248,81,73,0.1)", border: "rgba(248,81,73,0.2)", icon: XCircleIcon },
};

const LEFT_BORDER = {
  offer_sent: "2px solid #2cbe4e",
  hired: "2px solid #2cbe4e",
  interview_scheduled: "2px solid #8250df",
  interviewed: "2px solid #8250df",
  rejected: "2px solid #f85149",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "interviews", label: "Interviews" },
  { key: "offers", label: "Offers" },
  { key: "closed", label: "Closed" },
];

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
function MyApplicationsPage() {
  const [filterTab, setFilterTab] = useState("all");
  const { data: applications = [], isLoading } = useMyApplications();
  const { mutate: respondToOffer } = useRespondToOffer();

  const filtered = useMemo(() => {
    if (filterTab === "all") return applications;
    if (filterTab === "active") return applications.filter((a) => ["applied", "screening", "shortlisted"].includes(a.status));
    if (filterTab === "interviews") return applications.filter((a) => ["interview_scheduled", "interviewed"].includes(a.status));
    if (filterTab === "offers") return applications.filter((a) => ["offer_sent", "hired"].includes(a.status));
    if (filterTab === "closed") return applications.filter((a) => a.status === "rejected");
    return applications;
  }, [applications, filterTab]);

  const stats = useMemo(() => ({
    total: applications.length,
    inProgress: applications.filter((a) => !["hired", "rejected"].includes(a.status)).length,
    interviews: applications.filter((a) => ["interview_scheduled", "interviewed"].includes(a.status)).length,
    offers: applications.filter((a) => ["offer_sent", "hired"].includes(a.status)).length,
  }), [applications]);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── HEADER ───────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#2cbe4e] font-semibold mb-2">My Applications</p>
              <h1 className="text-2xl font-bold text-[#e6edf3]">Application Tracker</h1>
              <p className="text-[#7d8590] text-sm mt-1">{applications.length} total applications</p>
            </div>
            <Link
              to="/jobs"
              className="bg-[#2cbe4e] hover:bg-[#1a7f37] text-black rounded-lg px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <BriefcaseIcon className="size-4" />
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "#388bfd" },
              { label: "In Progress", value: stats.inProgress, color: "#d29922" },
              { label: "Interviews", value: stats.interviews, color: "#8250df" },
              { label: "Offers", value: stats.offers, color: "#2cbe4e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4" style={{ borderTop: `2px solid ${color}` }}>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-[#7d8590] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FILTER TABS ──────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="flex gap-2">
            {FILTER_TABS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterTab(f.key)}
                className={`text-xs px-4 py-1.5 rounded-full font-medium border transition-colors ${
                  filterTab === f.key
                    ? "bg-[#2cbe4e] text-black border-[#2cbe4e]"
                    : "bg-transparent text-[#7d8590] border-[#30363d] hover:text-[#e6edf3]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── LIST ─────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#161b22] border-2 border-dashed border-[#30363d] rounded-xl p-16 text-center">
              <InboxIcon className="size-12 text-[#30363d] mx-auto mb-4" />
              <p className="text-[#e6edf3] font-semibold">No applications yet</p>
              <Link to="/jobs" className="text-[#2cbe4e] text-sm hover:underline mt-3 block">Browse Jobs →</Link>
            </div>
          ) : (
            filtered.map((app) => {
              const job = typeof app.jobId === "object" ? app.jobId : null;
              const jobId = typeof app.jobId === "object" ? app.jobId._id : app.jobId;
              const cfg = APP_STATUS[app.status] || APP_STATUS.applied;
              const StatusIcon = cfg.icon;

              return (
                <motion.div
                  key={app._id}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.1 }}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-3 transition-all"
                  style={{
                    borderLeft: LEFT_BORDER[app.status] || "2px solid #30363d",
                    borderColor: undefined,
                  }}
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#1c2128] border border-[#30363d] flex items-center justify-center text-sm font-bold text-[#2cbe4e]">
                        {(job?.company || "?")[0].toUpperCase()}
                      </div>
                      <Link to={`/jobs/${jobId}`} className="font-semibold text-[#e6edf3] mt-3 block hover:text-[#2cbe4e] transition-colors">
                        {job?.title || "Unknown Position"}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-[#7d8590] mt-1">
                        {job?.company && <span className="flex items-center gap-1"><BuildingIcon className="size-3" />{job.company}</span>}
                        {job?.location && <span className="flex items-center gap-1"><MapPinIcon className="size-3" />{job.location}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                      <div
                        className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
                        style={{ background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}` }}
                      >
                        <StatusIcon size={12} />
                        {cfg.label}
                      </div>
                      <span className="text-[10px] text-[#484f58]">
                        Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Interview row */}
                  {app.status === "interview_scheduled" && app.interviewScheduledAt && (
                    <div className="mt-3 pt-3 border-t border-[#1c2128] flex items-center gap-2">
                      <CalendarIcon className="size-4 text-[#8250df]" />
                      <span className="text-xs text-[#7d8590]">Interview scheduled:</span>
                      <span className="text-xs font-medium text-[#8250df]">
                        {new Date(app.interviewScheduledAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Offer row */}
                  {(app.status === "offer_sent" || app.status === "hired") && (
                    <div className="mt-3 pt-3 border-t border-[#1c2128]">
                      <div className="rounded-lg p-3 flex items-center justify-between" style={{ background: "rgba(44,190,78,0.05)" }}>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="size-4 text-[#2cbe4e]" />
                          <span className="text-sm font-semibold text-[#2cbe4e]">
                            {app.status === "hired" ? "Offer Accepted!" : "Offer received!"}
                          </span>
                          {app.offeredSalary && (
                            <span className="text-[#7d8590] text-sm">
                              · <DollarSignIcon className="size-3 inline" />{app.offeredSalary.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {app.status === "offer_sent" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondToOffer({ id: app._id, response: "accepted" })}
                              className="bg-[#2cbe4e] text-black text-xs px-3 py-1 rounded-lg font-semibold hover:bg-[#1a7f37] transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToOffer({ id: app._id, response: "rejected" })}
                              className="border border-[#f85149] text-[#f85149] text-xs px-3 py-1 rounded-lg hover:bg-[rgba(248,81,73,0.1)] transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default MyApplicationsPage;
