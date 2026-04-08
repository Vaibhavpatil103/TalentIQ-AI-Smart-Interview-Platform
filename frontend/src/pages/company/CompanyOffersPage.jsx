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
} from "lucide-react";
import {
  PageHeader,
  MiniStat,
  FilterPills,
  EmptyState,
  T,
} from "../../components/ui/CompanyUI";

// ─── Offer status config ──────────────────────────────────────
const OFFER_STATUS = {
  pending:       { label: "Pending",     bg: "#fef9c3", color: "#ca8a04", border: "#facc15", icon: ClockIcon },
  accepted:      { label: "Accepted",    bg: "#dcfce7", color: "#16a34a", border: "#86efac", icon: CheckIcon },
  rejected:      { label: "Rejected",    bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", icon: XIcon },
  negotiating:   { label: "Negotiating", bg: "#e8f0fe", color: "#0a66c2", border: "#8bb9fe", icon: RefreshCwIcon },
};

const LEFT_BORDER = {
  pending:     "3px solid #ca8a04",
  accepted:    "3px solid #16a34a",
  rejected:    "3px solid #dc2626",
  negotiating: "3px solid #0a66c2",
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
    <div className="min-h-screen" style={{ backgroundColor: T.bgPage }}>
      <CompanyNavbar />

      <PageHeader
        eyebrow="Offer Management"
        title="Offers"
        subtitle={`${offers.length} offers sent · ${statusCounts.accepted} accepted · ${statusCounts.pending} pending response`}
      >
        <div className="flex gap-6 text-white flex-shrink-0">
          <div className="text-center">
            <p className="text-2xl font-bold">{statusCounts.accepted}</p>
            <p className="text-white/60 text-xs">Accepted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{statusCounts.pending}</p>
            <p className="text-white/60 text-xs">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{statusCounts.negotiating}</p>
            <p className="text-white/60 text-xs">Negotiating</p>
          </div>
        </div>
      </PageHeader>

      {/* ── STATS CARDS ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={SendIcon} accentColor={T.primary} label="Total Offers" value={offers.length} />
          <MiniStat icon={CheckIcon} accentColor="#16a34a" label="Accepted" value={statusCounts.accepted} />
          <MiniStat icon={ClockIcon} accentColor="#ca8a04" label="Pending" value={statusCounts.pending} />
          <MiniStat icon={XIcon} accentColor="#dc2626" label="Rejected / Negotiating" value={statusCounts.rejected + statusCounts.negotiating} />
        </div>
      </div>

      {/* ── FILTER + LIST ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-6">
          <FilterPills filters={FILTER_TABS} active={filterTab} onChange={setFilterTab} />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={SendIcon} title="No offers yet" subtitle="Send offers from the Candidates page to track them here" />
        ) : (
          filtered.map((app) => {
            const candidate = app.candidateObjectId;
            const job = typeof app.jobId === "object" ? app.jobId : jobs.find((j) => j._id === app.jobId);
            const status = app.offerStatus || "pending";
            const cfg = OFFER_STATUS[status] || OFFER_STATUS.pending;
            const StatusIcon = cfg.icon;
            const initials = (candidate?.name || "?")
              .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

            return (
              <motion.div key={app._id} whileHover={{ y: -1 }} transition={{ duration: 0.1 }}
                className="rounded-2xl p-5 mb-4 transition-all duration-200"
                style={{
                  backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
                  borderLeft: LEFT_BORDER[status] || LEFT_BORDER.pending,
                  boxShadow: T.shadowSm,
                }}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: T.primary }}>{initials}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: T.textPrimary }}>{candidate?.name || "Unknown"}</p>
                      <p className="text-xs truncate" style={{ color: T.textMuted }}>{candidate?.email || ""}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium truncate" style={{ color: T.textPrimary }}>{job?.title || "—"}</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>{job?.company || ""}</p>
                  </div>
                  <div className="col-span-2">
                    {app.offeredSalary ? (
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="size-3" style={{ color: T.textMuted }} />
                        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{app.offeredSalary.toLocaleString()}</span>
                        <span className="text-xs" style={{ color: T.textMuted }}>{job?.currency || "USD"}</span>
                      </div>
                    ) : <span className="text-sm" style={{ color: T.textDim }}>—</span>}
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit"
                      style={{ background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}` }}>
                      <StatusIcon size={12} />{cfg.label}
                    </div>
                    {app.offerSentAt && (
                      <p className="text-[10px] mt-1" style={{ color: T.textDim }}>
                        Sent {formatDistanceToNow(new Date(app.offerSentAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <Link to="/company/candidates" className="text-xs hover:underline font-medium" style={{ color: T.primary }}>View</Link>
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
