import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  BuildingIcon,
  ClockIcon,
  CheckCircleIcon,
} from "lucide-react";
import CompanyNavbar from "../../components/CompanyNavbar";
import { axiosInstance } from "../../lib/axios";

// ─── Color maps ───────────────────────────────────────────────
const STATUS_BADGE = {
  published: "bg-[#dcfce7] text-[#16a34a] border border-[#86efac]",
  draft:     "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]",
  closed:    "bg-[#fee2e2] text-[#dc2626] border border-[#ff8182]",
};

const APP_STATUS_BADGE = {
  applied:             "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
  screening:           "bg-[#fef9c3] text-[#ca8a04] border-[#e3b341]",
  shortlisted:         "bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]",
  interview_scheduled: "bg-[#f3e8ff] text-[#7c3aed] border-[#c4b5fd]",
  interviewed:         "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  offer_sent:          "bg-[#fef9c3] text-[#ca8a04] border-[#e3b341]",
  hired:               "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  rejected:            "bg-[#fee2e2] text-[#dc2626] border-[#ff8182]",
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-4 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] inline-block" />
    {children}
  </p>
);

// ─── Page ─────────────────────────────────────────────────────
function CompanyJobDetailPage() {
  const { id } = useParams();

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${id}`);
      return res.data.job;
    },
    enabled: !!id,
  });

  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["applications", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/applications/job/${id}`);
      return res.data.applications || [];
    },
    enabled: !!id,
  });

  const isLoading = jobLoading || appsLoading;

  // ── Derived stats ──────────────────────────────────────────
  const appStats = {
    total:      applications.length,
    pending:    applications.filter((a) => a.status === "applied").length,
    shortlisted:applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter(
      (a) => a.status === "interview_scheduled" || a.status === "interviewed"
    ).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <CompanyNavbar />
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <CompanyNavbar />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <BriefcaseIcon className="size-12 text-[#e2e8f0] mx-auto mb-4" />
          <p className="font-semibold text-[#0f172a]">Job not found</p>
          <Link to="/company/jobs" className="text-[#0a66c2] text-sm hover:underline mt-2 inline-block">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CompanyNavbar />

      {/* ── HEADER BAR ────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/company/jobs"
            className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0a66c2] transition-colors">
            <ArrowLeftIcon className="size-4" />
            Back to Jobs
          </Link>
          <Link to={`/company/candidates?job=${id}`}
            className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white
              rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
            <UsersIcon className="size-4" />
            View Applicants
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 pt-6 pb-16"
      >
        {/* ── HERO CARD ──────────────────────────────────────── */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-[#0f172a]">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {job.company && (
                  <span className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <BuildingIcon className="size-4" />{job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <MapPinIcon className="size-4" />{job.location}
                  </span>
                )}
                {job.jobType && (
                  <span className="flex items-center gap-1.5 text-sm text-[#64748b] capitalize">
                    <BriefcaseIcon className="size-4" />{job.jobType}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="flex items-center gap-1.5 text-sm text-[#64748b] capitalize">
                    <ClockIcon className="size-4" />{job.experienceLevel}
                  </span>
                )}
                {job.salaryMin && job.salaryMax && (
                  <span className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <DollarSignIcon className="size-4" />
                    {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()} {job.currency || "USD"}
                  </span>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`text-sm px-4 py-1.5 rounded-full font-medium
                ${STATUS_BADGE[job.status] || STATUS_BADGE.draft}`}>
                {job.status}
              </span>
              {job.deadline && (
                <p className="text-xs text-[#94a3b8] flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <>
              <div className="border-t border-[#f6f8fa] my-5" />
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-3">
                Required Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="bg-[#e8f0fe] text-[#0a66c2] border border-[#8bb9fe]
                    text-xs px-3 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT col-span-2 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
              <SectionLabel>Job Description</SectionLabel>
              <p className="text-sm text-[#64748b] leading-relaxed whitespace-pre-wrap">
                {job.description || "No description provided."}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <SectionLabel>Requirements</SectionLabel>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircleIcon className="size-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#64748b]">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT col-span-1 */}
          <div className="space-y-5">

            {/* Stats card */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
              <SectionLabel>Job Stats</SectionLabel>
              {[
                { label: "Total Applications", value: appStats.total,       color: appStats.total > 0       ? "#0a66c2" : "#0f172a" },
                { label: "Pending Review",     value: appStats.pending,     color: appStats.pending > 0     ? "#ca8a04" : "#0f172a" },
                { label: "Shortlisted",        value: appStats.shortlisted, color: appStats.shortlisted > 0 ? "#0a66c2" : "#0f172a" },
                { label: "Interviews",         value: appStats.interviews,  color: appStats.interviews > 0  ? "#7c3aed" : "#0f172a" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#f6f8fa] last:border-0">
                  <span className="text-sm text-[#64748b]">{label}</span>
                  <span className="font-bold text-sm" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recent applicants */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Recent Applicants</SectionLabel>
                <Link to={`/company/candidates?job=${id}`}
                  className="text-[#0a66c2] text-xs hover:underline font-medium">
                  View all →
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-6">
                  <UsersIcon className="size-8 text-[#e2e8f0] mx-auto mb-2" />
                  <p className="text-sm text-[#94a3b8]">No applicants yet</p>
                </div>
              ) : (
                <div>
                  {applications.slice(0, 4).map((app) => {
                    const candidate = app.candidateObjectId;
                    const initials = (candidate?.name || "?")[0].toUpperCase();
                    return (
                      <div key={app._id}
                        className="flex items-center justify-between py-2.5 border-b border-[#f6f8fa] last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0a66c2] text-white text-xs font-bold
                            flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-[#0f172a]">
                            {candidate?.name || "Unknown"}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                          ${APP_STATUS_BADGE[app.status] || APP_STATUS_BADGE.applied}`}>
                          {app.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CompanyJobDetailPage;
