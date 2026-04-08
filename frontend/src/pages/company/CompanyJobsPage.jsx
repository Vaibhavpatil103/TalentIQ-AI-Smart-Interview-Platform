import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  BriefcaseIcon,
  PlusIcon,
  BuildingIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  XIcon,
  Loader2Icon,
  CheckCircleIcon,
  EditIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyNavbar from "../../components/CompanyNavbar";
import { axiosInstance } from "../../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PageHeader,
  HeaderButton,
  MiniStat,
  ModalShell,
  FilterPills,
  EmptyState,
  T,
  inputCls,
  labelCls,
  btnPrimary,
  btnSecondary,
} from "../../components/ui/CompanyUI";

// ─── Status styles ────────────────────────────────────────────
const STATUS_BADGE = {
  published: "bg-[#dcfce7] text-[#16a34a] border-[#86efac]",
  draft:     "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]",
  closed:    "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]",
};

const STATUS_LEFT_BORDER = {
  published: "3px solid #16a34a",
  draft:     "3px solid #e2e8f0",
  closed:    "3px solid #dc2626",
};

const EMPTY_FORM = {
  title: "", description: "", requirements: "",
  skills: [], location: "Remote",
  jobType: "full-time", experienceLevel: "mid",
  salaryMin: "", salaryMax: "", currency: "USD", deadline: "",
};

// ─── Hooks (all unchanged) ────────────────────────────────────
function useMyJobs() {
  return useQuery({
    queryKey: ["myJobs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/jobs");
      return res.data.jobs || [];
    },
  });
}

function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosInstance.post("/jobs", data),
    onSuccess: () => { toast.success("Job created!"); qc.invalidateQueries({ queryKey: ["myJobs"] }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create job"),
  });
}

function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/jobs/${id}`, data),
    onSuccess: () => { toast.success("Job updated!"); qc.invalidateQueries({ queryKey: ["myJobs"] }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update job"),
  });
}

function usePublishJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.patch(`/jobs/${id}/publish`),
    onSuccess: () => { toast.success("Job published!"); qc.invalidateQueries({ queryKey: ["myJobs"] }); },
    onError: () => toast.error("Failed to publish"),
  });
}

function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.patch(`/jobs/${id}/close`),
    onSuccess: () => { toast.success("Job closed."); qc.invalidateQueries({ queryKey: ["myJobs"] }); },
    onError: () => toast.error("Failed to close job"),
  });
}

function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/jobs/${id}`),
    onSuccess: () => { toast.success("Job deleted."); qc.invalidateQueries({ queryKey: ["myJobs"] }); },
    onError: () => toast.error("Failed to delete job"),
  });
}

// ─── Shared modal form body ──────────────────────────────────
function JobFormFields({ form, setForm, tagInput, setTagInput }) {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const addSkill = () => {
    const s = tagInput.trim();
    if (!s || form.skills.includes(s)) { setTagInput(""); return; }
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setTagInput("");
  };
  const removeSkill = (s) => setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  return (
    <>
      <div>
        <label className={labelCls}>Job Title *</label>
        <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Senior Frontend Engineer" />
      </div>
      <div>
        <label className={labelCls}>Description *</label>
        <textarea className={`${inputCls} min-h-[100px] resize-none`} value={form.description} onChange={set("description")} placeholder="What will this person be doing..." />
      </div>
      <div>
        <label className={labelCls}>Requirements (one per line)</label>
        <textarea className={`${inputCls} min-h-[80px] resize-none`} value={form.requirements} onChange={set("requirements")} placeholder={`5+ years experience\nReact expertise\nStrong communication`} />
      </div>
      <div>
        <label className={labelCls}>Required Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.skills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: T.primaryLight, color: T.primary, border: `1px solid ${T.primaryBorder}` }}>
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-red-600"><XIcon className="size-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} placeholder="e.g. React, TypeScript" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
          <button onClick={addSkill} className={btnPrimary}>Add</button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls}>Min Salary</label>
          <input type="number" className={inputCls} value={form.salaryMin} onChange={set("salaryMin")} placeholder="50000" />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Max Salary</label>
          <input type="number" className={inputCls} value={form.salaryMax} onChange={set("salaryMax")} placeholder="100000" />
        </div>
        <div className="w-28 flex-shrink-0">
          <label className={labelCls}>Currency</label>
          <select className={inputCls} value={form.currency} onChange={set("currency")}>
            {["USD","INR","EUR","GBP"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location} onChange={set("location")} placeholder="Remote" />
        </div>
        <div>
          <label className={labelCls}>Job Type</label>
          <select className={inputCls} value={form.jobType} onChange={set("jobType")}>
            {["full-time","part-time","contract","internship"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Experience Level</label>
          <select className={inputCls} value={form.experienceLevel} onChange={set("experienceLevel")}>
            {["entry","mid","senior","lead"].map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Deadline</label>
          <input type="date" className={inputCls} value={form.deadline} onChange={set("deadline")} />
        </div>
      </div>
    </>
  );
}

// ─── Create Job Modal ─────────────────────────────────────────
function CreateJobModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const { mutate: createJob, isPending } = useCreateJob();

  const submit = (status) => {
    if (!form.title || !form.description) { toast.error("Title and description are required"); return; }
    const payload = {
      ...form,
      requirements: form.requirements.split("\n").filter(Boolean),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      status,
    };
    createJob(payload, { onSuccess: () => onClose() });
  };

  return (
    <ModalShell title="Post New Job" onClose={onClose} footer={
      <>
        <button onClick={() => submit("draft")} disabled={isPending} className={btnSecondary}>
          {isPending ? <Loader2Icon className="size-4 animate-spin inline mr-1" /> : null}Create as Draft
        </button>
        <button onClick={() => submit("published")} disabled={isPending} className={btnPrimary}>
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}Publish Now
        </button>
      </>
    }>
      <JobFormFields form={form} setForm={setForm} tagInput={tagInput} setTagInput={setTagInput} />
    </ModalShell>
  );
}

// ─── Edit Job Modal ───────────────────────────────────────────
function EditJobModal({ job, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const { mutate: updateJob, isPending } = useUpdateJob();

  useEffect(() => {
    if (!job) return;
    setForm({
      title:           job.title           || "",
      description:     job.description     || "",
      requirements:    Array.isArray(job.requirements)
                         ? job.requirements.join("\n")
                         : job.requirements || "",
      skills:          job.skills          || [],
      location:        job.location        || "Remote",
      jobType:         job.jobType         || "full-time",
      experienceLevel: job.experienceLevel || "mid",
      salaryMin:       job.salaryMin       ?? "",
      salaryMax:       job.salaryMax       ?? "",
      currency:        job.currency        || "USD",
      deadline:        job.deadline
                         ? new Date(job.deadline).toISOString().split("T")[0]
                         : "",
      status:          job.status          || "draft",
    });
  }, [job]);

  const handleSave = () => {
    if (!form.title || !form.description) { toast.error("Title and description are required"); return; }
    const payload = {
      ...form,
      requirements: typeof form.requirements === "string"
        ? form.requirements.split("\n").filter(Boolean)
        : form.requirements,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    };
    updateJob({ id: job._id, ...payload }, { onSuccess: () => onClose() });
  };

  return (
    <ModalShell title="Edit Job" onClose={onClose} footer={
      <>
        <button onClick={onClose} className={btnSecondary}>Cancel</button>
        <button onClick={handleSave} disabled={isPending} className={btnPrimary}>
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}Save Changes
        </button>
      </>
    }>
      <JobFormFields form={form} setForm={setForm} tagInput={tagInput} setTagInput={setTagInput} />
      <div>
        <label className={labelCls}>Status</label>
        <select className={inputCls} value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </ModalShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────
const FILTERS = ["all","published","draft","closed"];

function CompanyJobsPage() {
  const [filterTab, setFilterTab]   = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const { data: jobs = [], isLoading } = useMyJobs();
  const { mutate: publishJob } = usePublishJob();
  const { mutate: closeJob }   = useCloseJob();
  const { mutate: deleteJob }  = useDeleteJob();

  const filtered = filterTab === "all" ? jobs : jobs.filter((j) => j.status === filterTab);
  const stats = {
    total:     jobs.length,
    published: jobs.filter((j) => j.status === "published").length,
    draft:     jobs.filter((j) => j.status === "draft").length,
    closed:    jobs.filter((j) => j.status === "closed").length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.bgPage }}>
      <CompanyNavbar />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <PageHeader
        eyebrow="Job Management"
        title="Job Postings"
        subtitle={`${stats.published} published · ${stats.draft} drafts · ${stats.total} total`}
      >
        <HeaderButton onClick={() => setShowCreate(true)} icon={PlusIcon}>
          Post New Job
        </HeaderButton>
      </PageHeader>

      {/* ── MINI STAT CARDS ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={BriefcaseIcon} accentColor={T.primary} label="Total Jobs" value={stats.total} />
          <MiniStat icon={CheckCircleIcon} accentColor="#16a34a" label="Published" value={stats.published} />
          <MiniStat icon={EditIcon} accentColor="#ca8a04" label="Drafts" value={stats.draft} />
          <MiniStat icon={XIcon} accentColor="#64748b" label="Closed" value={stats.closed} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-6 pb-16">

        {/* Filter pills */}
        <div className="mb-6">
          <FilterPills filters={FILTERS} active={filterTab} onChange={setFilterTab} />
        </div>

        {/* Jobs list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No jobs posted yet"
            subtitle="Create your first job posting to start finding candidates"
            action="Post a Job"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          filtered.map((job) => (
            <motion.div key={job._id} whileHover={{ y: -1 }} transition={{ duration: 0.1 }}
              className="rounded-2xl p-5 mb-4 transition-all duration-200"
              style={{
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderLeft: STATUS_LEFT_BORDER[job.status] || STATUS_LEFT_BORDER.draft,
                boxShadow: T.shadowSm,
              }}>

              {/* Top row */}
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/company/jobs/${job._id}`}
                    className="font-semibold text-base transition-colors hover:underline"
                    style={{ color: T.textPrimary }}>
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm flex-wrap" style={{ color: T.textMuted }}>
                    <span className="flex items-center gap-1"><BuildingIcon className="size-3" />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPinIcon className="size-3" />{job.location}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: T.bgPage, color: T.textMuted, border: `1px solid ${T.border}` }}>
                      {job.jobType}
                    </span>
                    {job.experienceLevel && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f3e8ff", color: "#7c3aed", border: "1px solid #c4b5fd" }}>
                        {job.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium flex-shrink-0
                  ${STATUS_BADGE[job.status] || STATUS_BADGE.draft}`}>
                  {job.status}
                </span>
              </div>

              {/* Skills + Salary */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3" style={{ borderTop: `1px solid ${T.borderLight}` }}>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills?.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: T.bgPage, color: T.textMuted, border: `1px solid ${T.border}` }}>{s}</span>
                  ))}
                  {(job.skills?.length || 0) > 4 && (
                    <span className="text-xs" style={{ color: T.textMuted }}>+{job.skills.length - 4} more</span>
                  )}
                </div>
                {job.salaryMin && job.salaryMax && (
                  <span className="text-sm flex items-center gap-1" style={{ color: T.textMuted }}>
                    <DollarSignIcon className="size-3" />
                    {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()} {job.currency}
                  </span>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: `1px solid ${T.borderLight}` }}>
                <div className="flex items-center gap-4 text-sm" style={{ color: T.textMuted }}>
                  <span className="flex items-center gap-1"><UsersIcon className="size-3" />{job.applicantCount || 0} applicants</span>
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/company/candidates?job=${job._id}`}
                    className="text-sm font-medium hover:underline" style={{ color: T.primary }}>
                    View Applicants
                  </Link>
                  {job.status === "draft" && (
                    <button onClick={() => publishJob(job._id)}
                      className="text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                      style={{ backgroundColor: T.primary }}>
                      Publish
                    </button>
                  )}
                  {job.status === "published" && (
                    <button onClick={() => closeJob(job._id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                      style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
                      Close
                    </button>
                  )}
                  <button onClick={() => setEditingJob(job)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
                    Edit
                  </button>
                  <button onClick={() => { if (confirm("Delete this job?")) deleteJob(job._id); }}
                    className="text-xs hover:underline ml-1" style={{ color: "#dc2626" }}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingJob && <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default CompanyJobsPage;
