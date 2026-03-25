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
  published: "bg-[#dafbe1] text-[#1a7f37] border border-[#56d364]",
  draft:     "bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de]",
  closed:    "bg-[#ffebe9] text-[#cf222e] border border-[#ff8182]",
};

const APP_STATUS_BADGE = {
  applied:             "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]",
  screening:           "bg-[#fff8c5] text-[#9a6700] border-[#e3b341]",
  shortlisted:         "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]",
  interview_scheduled: "bg-[#fbefff] text-[#8250df] border-[#d2a8ff]",
  interviewed:         "bg-[#dafbe1] text-[#1a7f37] border-[#56d364]",
  offer_sent:          "bg-[#fff8c5] text-[#9a6700] border-[#e3b341]",
  hired:               "bg-[#dafbe1] text-[#1a7f37] border-[#56d364]",
  rejected:            "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]",
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-[#57606a] mb-4 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-[#0969da] inline-block" />
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
      <div className="min-h-screen bg-[#f6f8fa]">
        <CompanyNavbar />
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#d0d7de] h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f6f8fa]">
        <CompanyNavbar />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <BriefcaseIcon className="size-12 text-[#d0d7de] mx-auto mb-4" />
          <p className="font-semibold text-[#1c2128]">Job not found</p>
          <Link to="/company/jobs" className="text-[#0969da] text-sm hover:underline mt-2 inline-block">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* ── HEADER BAR ────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#d0d7de] py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/company/jobs"
            className="flex items-center gap-2 text-sm text-[#57606a] hover:text-[#0969da] transition-colors">
            <ArrowLeftIcon className="size-4" />
            Back to Jobs
          </Link>
          <Link to={`/company/candidates?job=${id}`}
            className="flex items-center gap-2 bg-[#0969da] hover:bg-[#0550ae] text-white
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
        <div className="bg-white border border-[#d0d7de] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-[#1c2128]">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {job.company && (
                  <span className="flex items-center gap-1.5 text-sm text-[#57606a]">
                    <BuildingIcon className="size-4" />{job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5 text-sm text-[#57606a]">
                    <MapPinIcon className="size-4" />{job.location}
                  </span>
                )}
                {job.jobType && (
                  <span className="flex items-center gap-1.5 text-sm text-[#57606a] capitalize">
                    <BriefcaseIcon className="size-4" />{job.jobType}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="flex items-center gap-1.5 text-sm text-[#57606a] capitalize">
                    <ClockIcon className="size-4" />{job.experienceLevel}
                  </span>
                )}
                {job.salaryMin && job.salaryMax && (
                  <span className="flex items-center gap-1.5 text-sm text-[#57606a]">
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
                <p className="text-xs text-[#8c959f] flex items-center gap-1">
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
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#57606a] mb-3">
                Required Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]
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
            <div className="bg-white border border-[#d0d7de] rounded-xl p-6">
              <SectionLabel>Job Description</SectionLabel>
              <p className="text-sm text-[#57606a] leading-relaxed whitespace-pre-wrap">
                {job.description || "No description provided."}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white border border-[#d0d7de] rounded-xl p-6">
                <SectionLabel>Requirements</SectionLabel>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircleIcon className="size-4 text-[#1a7f37] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#57606a]">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT col-span-1 */}
          <div className="space-y-5">

            {/* Stats card */}
            <div className="bg-white border border-[#d0d7de] rounded-xl p-5">
              <SectionLabel>Job Stats</SectionLabel>
              {[
                { label: "Total Applications", value: appStats.total,       color: appStats.total > 0       ? "#0969da" : "#1c2128" },
                { label: "Pending Review",     value: appStats.pending,     color: appStats.pending > 0     ? "#9a6700" : "#1c2128" },
                { label: "Shortlisted",        value: appStats.shortlisted, color: appStats.shortlisted > 0 ? "#0969da" : "#1c2128" },
                { label: "Interviews",         value: appStats.interviews,  color: appStats.interviews > 0  ? "#8250df" : "#1c2128" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#f6f8fa] last:border-0">
                  <span className="text-sm text-[#57606a]">{label}</span>
                  <span className="font-bold text-sm" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recent applicants */}
            <div className="bg-white border border-[#d0d7de] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Recent Applicants</SectionLabel>
                <Link to={`/company/candidates?job=${id}`}
                  className="text-[#0969da] text-xs hover:underline font-medium">
                  View all →
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-6">
                  <UsersIcon className="size-8 text-[#d0d7de] mx-auto mb-2" />
                  <p className="text-sm text-[#8c959f]">No applicants yet</p>
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
                          <div className="w-7 h-7 rounded-full bg-[#0969da] text-white text-xs font-bold
                            flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-[#1c2128]">
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
