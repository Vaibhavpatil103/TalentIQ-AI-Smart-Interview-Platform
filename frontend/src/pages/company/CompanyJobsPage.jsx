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

// ─── Shared styles ─────────────────────────────────────────────
const inputCls = `bg-white border border-[#d0d7de] text-[#1c2128] rounded-lg px-3 py-2.5
  text-sm w-full outline-none focus:border-[#0969da] focus:ring-2
  focus:ring-[#0969da20] transition-colors`;
const labelCls = "block text-xs font-semibold text-[#57606a] uppercase tracking-wider mb-1.5";

const STATUS_BADGE = {
  published: "bg-[#dafbe1] text-[#1a7f37] border-[#56d364]",
  draft:     "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]",
  closed:    "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]",
};

const STATUS_LEFT_BORDER = {
  published: "3px solid #1a7f37",
  draft:     "3px solid #d0d7de",
  closed:    "3px solid #cf222e",
};

const EMPTY_FORM = {
  title: "", description: "", requirements: "",
  skills: [], location: "Remote",
  jobType: "full-time", experienceLevel: "mid",
  salaryMin: "", salaryMax: "", currency: "USD", deadline: "",
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-[#57606a] mb-4 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-[#0969da] inline-block" />
    {children}
  </p>
);

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
            <span key={s} className="flex items-center gap-1.5 bg-[#ddf4ff] text-[#0969da] border border-[#54aeff] text-xs px-3 py-1 rounded-full font-medium">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-[#cf222e]"><XIcon className="size-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} placeholder="e.g. React, TypeScript" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
          <button onClick={addSkill} className="bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-shrink-0">Add</button>
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

// ─── ModalShell ───────────────────────────────────────────────
function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.96, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white border border-[#d0d7de] rounded-2xl w-full max-w-2xl mx-4 shadow-xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d0d7de] flex-shrink-0">
          <h3 className="font-bold text-[#1c2128] text-lg">{title}</h3>
          <button onClick={onClose} className="text-[#57606a] hover:text-[#1c2128]"><XIcon className="size-5" /></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">{children}</div>
        <div className="px-6 py-4 border-t border-[#d0d7de] flex gap-3 justify-end flex-shrink-0">{footer}</div>
      </motion.div>
    </div>
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
        <button onClick={() => submit("draft")} disabled={isPending}
          className="px-4 py-2 rounded-lg border border-[#d0d7de] text-sm text-[#57606a] hover:bg-[#f6f8fa] transition-colors disabled:opacity-50">
          {isPending ? <Loader2Icon className="size-4 animate-spin inline mr-1" /> : null}Create as Draft
        </button>
        <button onClick={() => submit("published")} disabled={isPending}
          className="flex items-center gap-2 bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
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
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#d0d7de] text-sm text-[#57606a] hover:bg-[#f6f8fa] transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isPending}
          className="flex items-center gap-2 bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}Save Changes
        </button>
      </>
    }>
      <JobFormFields form={form} setForm={setForm} tagInput={tagInput} setTagInput={setTagInput} />
      {/* Status field — only in edit mode */}
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

// ─── Mini stat card for header ───────────────────────────────
function MiniStat({ icon: Icon, iconBg, topColor, label, value }) {
  return (
    <div className="bg-white border border-[#d0d7de] rounded-xl p-4 flex-1"
      style={{ borderTop: `3px solid ${topColor}` }}>
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
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="relative overflow-hidden py-8 px-6"
        style={{ background: "linear-gradient(135deg, #0969da 0%, #0550ae 100%)" }}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-16 w-40 h-40 rounded-full pointer-events-none"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10 gap-6">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 font-medium">
              Job Management
            </p>
            <h1 className="text-2xl font-bold text-white">Job Postings</h1>
            <p className="text-white/70 text-sm mt-1">
              {stats.published} published · {stats.draft} drafts · {stats.total} total
            </p>
          </div>
          <motion.button onClick={() => setShowCreate(true)} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-white text-[#0969da] font-semibold
              rounded-lg px-4 py-2 text-sm hover:bg-[#f6f8fa] transition-colors flex-shrink-0">
            <PlusIcon className="size-4" />
            Post New Job
          </motion.button>
        </div>
      </div>

      {/* ── MINI STAT CARDS ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={BriefcaseIcon} iconBg="#ddf4ff" topColor="#0969da"
            label="Total Jobs" value={stats.total} />
          <MiniStat icon={CheckCircleIcon} iconBg="#dafbe1" topColor="#1a7f37"
            label="Published" value={stats.published} />
          <MiniStat icon={EditIcon} iconBg="#fff8c5" topColor="#bf8700"
            label="Drafts" value={stats.draft} />
          <MiniStat icon={XIcon} iconBg="#f6f8fa" topColor="#57606a"
            label="Closed" value={stats.closed} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-6 pb-16">

        {/* Filter pills */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilterTab(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border
                transition-colors ${filterTab === f
                  ? "bg-[#0969da] text-white border-[#0969da]"
                  : "bg-white text-[#57606a] border-[#d0d7de] hover:bg-[#f6f8fa]"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Jobs list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#d0d7de] h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#d0d7de] rounded-xl p-16 text-center">
            <BriefcaseIcon className="size-12 text-[#d0d7de] mx-auto mb-4" />
            <p className="font-semibold text-[#1c2128]">No jobs posted yet</p>
            <p className="text-sm text-[#57606a] mt-2">Create your first job posting to start finding candidates</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-6 bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors">
              Post a Job
            </button>
          </div>
        ) : (
          filtered.map((job) => (
            <motion.div key={job._id} whileHover={{ y: -1 }} transition={{ duration: 0.1 }}
              className="bg-white border border-[#d0d7de] rounded-xl p-5 mb-4 hover:shadow-sm transition-all"
              style={{ borderLeft: STATUS_LEFT_BORDER[job.status] || STATUS_LEFT_BORDER.draft }}>

              {/* Top row */}
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/company/jobs/${job._id}`}
                    className="font-semibold text-[#1c2128] text-base hover:text-[#0969da] transition-colors">
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[#57606a] flex-wrap">
                    <span className="flex items-center gap-1"><BuildingIcon className="size-3" />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPinIcon className="size-3" />{job.location}</span>
                    <span className="bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de] text-xs px-2 py-0.5 rounded-full">
                      {job.jobType}
                    </span>
                    {job.experienceLevel && (
                      <span className="bg-[#fbefff] text-[#8250df] border border-[#d8b4fe] text-xs px-2 py-0.5 rounded-full">
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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-[#f6f8fa]">
                <div className="flex flex-wrap gap-1.5">
                  {job.skills?.slice(0, 4).map((s) => (
                    <span key={s} className="bg-[#f6f8fa] text-[#57606a] text-xs px-2 py-0.5 rounded-md border border-[#d0d7de]">{s}</span>
                  ))}
                  {(job.skills?.length || 0) > 4 && (
                    <span className="text-xs text-[#57606a]">+{job.skills.length - 4} more</span>
                  )}
                </div>
                {job.salaryMin && job.salaryMax && (
                  <span className="text-sm text-[#57606a] flex items-center gap-1">
                    <DollarSignIcon className="size-3" />
                    {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()} {job.currency}
                  </span>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#f6f8fa]">
                <div className="flex items-center gap-4 text-sm text-[#57606a]">
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
                    className="text-[#0969da] text-sm font-medium hover:underline">
                    View Applicants
                  </Link>
                  {job.status === "draft" && (
                    <button onClick={() => publishJob(job._id)}
                      className="bg-[#0969da] hover:bg-[#0550ae] text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Publish
                    </button>
                  )}
                  {job.status === "published" && (
                    <button onClick={() => closeJob(job._id)}
                      className="border border-[#d0d7de] hover:border-[#0969da] text-[#57606a] text-xs px-3 py-1.5 rounded-lg transition-colors">
                      Close
                    </button>
                  )}
                  {/* ── NEW: Edit button ── */}
                  <button onClick={() => setEditingJob(job)}
                    className="border border-[#d0d7de] hover:border-[#0969da] text-[#57606a]
                      hover:text-[#0969da] text-xs px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => { if (confirm("Delete this job?")) deleteJob(job._id); }}
                    className="text-[#cf222e] text-xs hover:underline ml-1">
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
