import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { axiosInstance } from "../../lib/axios";
import CompanyNavbar from "../../components/CompanyNavbar";
import { formatDistanceToNow } from "date-fns";
import {
  SendIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  DollarSignIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";

// ─── Offer status config ──────────────────────────────────────
const OFFER_STATUS = {
  pending: {
    label: "Pending",
    bg: "#fff8c5", color: "#9a6700", border: "#e3b341",
    icon: ClockIcon,
  },
  accepted: {
    label: "Accepted",
    bg: "#dafbe1", color: "#1a7f37", border: "#56d364",
    icon: CheckIcon,
  },
  rejected: {
    label: "Rejected",
    bg: "#ffebe9", color: "#cf222e", border: "#ff8182",
    icon: XIcon,
  },
  negotiating: {
    label: "Negotiating",
    bg: "#ddf4ff", color: "#0969da", border: "#54aeff",
    icon: RefreshCwIcon,
  },
};

const LEFT_BORDER = {
  pending: "3px solid #bf8700",
  accepted: "3px solid #1a7f37",
  rejected: "3px solid #cf222e",
  negotiating: "3px solid #0969da",
};

const FILTER_TABS = ["all", "pending", "accepted", "rejected", "negotiating"];

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

function useAllOffers(jobIds) {
  return useQuery({
    queryKey: ["allOffers", jobIds],
    queryFn: async () => {
      if (!jobIds?.length) return [];
      const results = await Promise.all(
        jobIds.map((id) =>
          axiosInstance
            .get(`/applications/job/${id}`)
            .then((r) => (r.data.applications || []).filter((a) => a.offerSent))
            .catch(() => [])
        )
      );
      return results.flat().sort((a, b) => new Date(b.offerSentAt) - new Date(a.offerSentAt));
    },
    enabled: !!jobIds?.length,
  });
}

// ─── Mini stat card ───────────────────────────────────────────
function MiniStat({ icon: Icon, iconBg, topColor, label, value }) {
  return (
    <div className="bg-white border border-[#d0d7de] rounded-xl p-4 flex-1" style={{ borderTop: `3px solid ${topColor}` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="size-4" style={{ color: topColor }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1c2128]">{value}</p>
      <p className="text-xs text-[#57606a] mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
function CompanyOffersPage() {
  const [filterTab, setFilterTab] = useState("all");

  const { data: jobs = [] } = useMyJobs();
  const jobIds = jobs.map((j) => j._id);
  const { data: offers = [], isLoading } = useAllOffers(jobIds);

  const statusCounts = {
    accepted: offers.filter((a) => a.offerStatus === "accepted").length,
    pending: offers.filter((a) => a.offerStatus === "pending" || !a.offerStatus).length,
    rejected: offers.filter((a) => a.offerStatus === "rejected").length,
    negotiating: offers.filter((a) => a.offerStatus === "negotiating").length,
  };

  const filtered =
    filterTab === "all"
      ? offers
      : offers.filter((a) => {
          if (filterTab === "pending") return a.offerStatus === "pending" || !a.offerStatus;
          return a.offerStatus === filterTab;
        });

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-8 px-6"
        style={{ background: "linear-gradient(135deg, #0969da 0%, #0550ae 100%)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

        <div className="max-w-7xl mx-auto flex items-start justify-between relative z-10 gap-6">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 font-medium">
              Offer Management
            </p>
            <h1 className="text-2xl font-bold text-white">Offers</h1>
            <p className="text-white/70 text-sm mt-1">
              {offers.length} offers sent · {statusCounts.accepted} accepted · {statusCounts.pending} pending response
            </p>
          </div>
          <div className="flex gap-6 text-white flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold">{statusCounts.accepted}</p>
              <p className="text-white/70 text-xs">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statusCounts.pending}</p>
              <p className="text-white/70 text-xs">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statusCounts.negotiating}</p>
              <p className="text-white/70 text-xs">Negotiating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={SendIcon} iconBg="#ddf4ff" topColor="#0969da" label="Total Offers" value={offers.length} />
          <MiniStat icon={CheckIcon} iconBg="#dafbe1" topColor="#1a7f37" label="Accepted" value={statusCounts.accepted} />
          <MiniStat icon={ClockIcon} iconBg="#fff8c5" topColor="#bf8700" label="Pending" value={statusCounts.pending} />
          <MiniStat icon={XIcon} iconBg="#ffebe9" topColor="#cf222e" label="Rejected / Negotiating" value={statusCounts.rejected + statusCounts.negotiating} />
        </div>
      </div>

      {/* ── FILTER + LIST ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 pb-16"
      >
        {/* Filter pills */}
        <div className="flex gap-2 mb-6">
          {FILTER_TABS.map((f) => (
            <button
              key={f}
              onClick={() => setFilterTab(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border transition-colors ${
                filterTab === f
                  ? "bg-[#0969da] text-white border-[#0969da]"
                  : "bg-white text-[#57606a] border-[#d0d7de] hover:bg-[#f6f8fa]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#d0d7de] h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#d0d7de] rounded-xl p-16 text-center">
            <SendIcon className="size-12 text-[#d0d7de] mx-auto mb-4" />
            <p className="font-semibold text-[#1c2128]">No offers yet</p>
            <p className="text-sm text-[#57606a] mt-2">Send offers from the Candidates page to track them here</p>
          </div>
        ) : (
          filtered.map((app) => {
            const candidate = app.candidateObjectId;
            const job = typeof app.jobId === "object" ? app.jobId : jobs.find((j) => j._id === app.jobId);
            const status = app.offerStatus || "pending";
            const cfg = OFFER_STATUS[status] || OFFER_STATUS.pending;
            const StatusIcon = cfg.icon;
            const initials = (candidate?.name || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={app._id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.1 }}
                className="bg-white border border-[#d0d7de] rounded-xl p-5 mb-4 hover:shadow-sm transition-all"
                style={{ borderLeft: LEFT_BORDER[status] || LEFT_BORDER.pending }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Candidate (4) */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0969da] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#1c2128] truncate">{candidate?.name || "Unknown"}</p>
                      <p className="text-xs text-[#57606a] truncate">{candidate?.email || ""}</p>
                    </div>
                  </div>

                  {/* Position (3) */}
                  <div className="col-span-3">
                    <p className="text-sm text-[#1c2128] font-medium truncate">{job?.title || "—"}</p>
                    <p className="text-xs text-[#57606a]">{job?.company || ""}</p>
                  </div>

                  {/* Salary (2) */}
                  <div className="col-span-2">
                    {app.offeredSalary ? (
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="size-3 text-[#57606a]" />
                        <span className="text-sm font-semibold text-[#1c2128]">
                          {app.offeredSalary.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#57606a]">{job?.currency || "USD"}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#8c959f]">—</span>
                    )}
                  </div>

                  {/* Status (2) */}
                  <div className="col-span-2">
                    <div
                      className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit"
                      style={{ background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}` }}
                    >
                      <StatusIcon size={12} />
                      {cfg.label}
                    </div>
                    {app.offerSentAt && (
                      <p className="text-[10px] text-[#8c959f] mt-1">
                        Sent {formatDistanceToNow(new Date(app.offerSentAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  {/* View (1) */}
                  <div className="col-span-1 text-right">
                    <Link to="/company/candidates" className="text-[#0969da] text-xs hover:underline font-medium">
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}

export default CompanyOffersPage;
