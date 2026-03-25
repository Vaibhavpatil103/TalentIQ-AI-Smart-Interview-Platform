import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  BuildingIcon,
  Code2Icon,
  GlobeIcon,
  MapPinIcon,
  SaveIcon,
  Loader2Icon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import CompanyNavbar from "../../components/CompanyNavbar";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const inputCls = `bg-white border border-[#d0d7de] text-[#1c2128] rounded-lg px-3 py-2.5
  text-sm w-full outline-none focus:border-[#0969da] focus:ring-2
  focus:ring-[#0969da20] transition-colors`;

const labelCls = "block text-xs font-semibold text-[#57606a] uppercase tracking-wider mb-1.5";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Education",
  "E-commerce","Media","Consulting","Other",
];
const SIZES = ["1-10","11-50","51-200","201-500","500+"];

function CompanyProfilePage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "Technology",
    size: "1-10",
    location: "",
    website: "",
    linkedin: "",
    about: "",
    techStack: [],
  });

  // Load existing profile
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/company/profile");
        if (res.data.profile) {
          setForm((prev) => ({ ...prev, ...res.data.profile }));
        }
      } catch { /* no profile yet */ }
    };
    load();
  }, []);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || form.techStack.includes(tag)) { setTagInput(""); return; }
    setForm((prev) => ({ ...prev, techStack: [...prev.techStack, tag] }));
    setTagInput("");
  };

  const removeTag = (tag) =>
    setForm((prev) => ({ ...prev, techStack: prev.techStack.filter((t) => t !== tag) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/company/profile", form);
      toast.success("Company profile saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const initials = ((user?.firstName || "")[0] + (user?.lastName || "")[0]).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-6 py-8"
      >
        {/* ── CARD 1: Recruiter Info ─────────────────────────── */}
        <div className="bg-white border border-[#d0d7de] rounded-xl p-6 mb-6 flex items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="avatar"
                className="w-16 h-16 rounded-full ring-2 ring-[#0969da] ring-offset-2 ring-offset-[#f6f8fa] object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#0969da] text-white text-xl font-bold
                flex items-center justify-center ring-2 ring-[#0969da] ring-offset-2 ring-offset-[#f6f8fa]">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xl font-bold text-[#1c2128]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-[#57606a] mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <span className="inline-flex items-center gap-1 bg-[#ddf4ff] text-[#0969da]
              border border-[#54aeff] text-xs px-3 py-1 rounded-full font-semibold mt-2">
              <ShieldCheckIcon className="size-3" />
              Recruiter
            </span>
          </div>
        </div>

        {/* ── CARD 2: Company Details ────────────────────────── */}
        <div className="bg-white border border-[#d0d7de] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-1 pb-4 border-b border-[#f6f8fa]">
            <BuildingIcon className="size-4 text-[#0969da]" />
            <h2 className="text-base font-semibold text-[#1c2128]">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Company Name — full width */}
            <div className="md:col-span-2">
              <label className={labelCls}>Company Name</label>
              <input className={inputCls} value={form.companyName} onChange={set("companyName")} placeholder="Acme Corp" />
            </div>

            {/* Industry */}
            <div>
              <label className={labelCls}>Industry</label>
              <select className={inputCls} value={form.industry} onChange={set("industry")}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className={labelCls}>Company Size</label>
              <select className={inputCls} value={form.size} onChange={set("size")}>
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className={labelCls}>Location</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8c959f]" />
                <input className={`${inputCls} pl-9`} value={form.location} onChange={set("location")} placeholder="San Francisco, CA" />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className={labelCls}>Website</label>
              <div className="relative">
                <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8c959f]" />
                <input className={`${inputCls} pl-9`} value={form.website} onChange={set("website")} placeholder="https://acme.com" />
              </div>
            </div>

            {/* LinkedIn — full width */}
            <div className="md:col-span-2">
              <label className={labelCls}>LinkedIn URL</label>
              <input className={inputCls} value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/company/acme" />
            </div>

            {/* About — full width */}
            <div className="md:col-span-2">
              <label className={labelCls}>About Company</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-none`}
                value={form.about}
                onChange={set("about")}
                placeholder="Describe your company culture, mission, and what makes you a great place to work..."
              />
            </div>
          </div>
        </div>

        {/* ── CARD 3: Tech Stack ────────────────────────────── */}
        <div className="bg-white border border-[#d0d7de] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Code2Icon className="size-4 text-[#0969da]" />
            <h2 className="text-base font-semibold text-[#1c2128]">Tech Stack & Requirements</h2>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {form.techStack.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 bg-[#ddf4ff] text-[#0969da]
                border border-[#54aeff] text-xs px-3 py-1 rounded-full font-medium">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-[#cf222e] transition-colors">
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
            {form.techStack.length === 0 && (
              <span className="text-xs text-[#8c959f]">No technologies added yet</span>
            )}
          </div>

          {/* Add tag */}
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Add technology e.g. React, Node.js"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <button
              onClick={addTag}
              className="bg-[#0969da] hover:bg-[#0550ae] text-white rounded-lg px-3 py-2
                text-sm font-medium transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* ── SAVE BUTTON ───────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-[#0969da] hover:bg-[#0550ae]
            disabled:opacity-50 text-white rounded-lg px-6 py-2.5 text-sm font-semibold
            transition-colors w-full"
        >
          {saving
            ? <Loader2Icon className="size-4 animate-spin" />
            : <SaveIcon className="size-4" />}
          {saving ? "Saving…" : "Save Company Profile"}
        </button>
      </motion.div>
    </div>
  );
}

export default CompanyProfilePage;
