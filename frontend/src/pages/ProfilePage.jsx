import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  UserIcon, BriefcaseIcon, GithubIcon, FileTextIcon, SaveIcon,
  Loader2Icon, CodeIcon, AwardIcon, TrendingUpIcon, TargetIcon
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import XPProgressBar from "../components/XPProgressBar";
import BadgeGrid from "../components/BadgeGrid";

function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "",
    resumeUrl: "",
    githubUrl: "",
    techStack: [],
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/users/profile");
      setProfile(res.data.user);
      setForm({
        company: res.data.user.company || "",
        resumeUrl: res.data.user.resumeUrl || "",
        githubUrl: res.data.user.githubUrl || "",
        techStack: res.data.user.techStack || [],
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("/users/profile", form);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.techStack.includes(newSkill.trim())) {
      setForm({ ...form, techStack: [...form.techStack, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, techStack: form.techStack.filter((s) => s !== skill) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="card-dark p-8 mb-6 flex items-start gap-8">
            <div className="size-24 rounded-full bg-[#1c2128] animate-pulse shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-[#1c2128] rounded-lg animate-pulse w-1/3" />
              <div className="h-4 bg-[#1c2128] rounded-lg animate-pulse w-1/4" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                 <div className="h-24 bg-[#1c2128] rounded-xl animate-pulse" />
                 <div className="h-24 bg-[#1c2128] rounded-xl animate-pulse" />
                 <div className="h-24 bg-[#1c2128] rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for new UI requirements since no API call was added
  const mockXP = 2450;
  const mockLevel = 4;
  const mockStats = [
    { label: "Interviews", value: profile?.interviewsCompleted || 12, icon: TargetIcon, color: "text-[#58a6ff]" },
    { label: "Avg Score", value: "8.4", icon: TrendingUpIcon, color: "text-[#2cbe4e]" },
    { label: "Badges", value: 5, icon: AwardIcon, color: "text-[#d29922]" },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        {/* Profile Header */}
        <div className="card-dark p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2cbe4e] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="shrink-0">
            <div className="size-24 rounded-full ring-2 ring-[#2cbe4e] ring-offset-2 ring-offset-[#0d1117] p-1">
              <img src={user?.imageUrl || (profile?.profileImage || "/default-avatar.png")} alt={profile?.name} className="size-full rounded-full object-cover" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-[#e6edf3]">{profile?.name}</h1>
              <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-[#2cbe4e40] text-[#2cbe4e] bg-[#2cbe4e10]">
                {profile?.role || "candidate"}
              </span>
            </div>
            <p className="text-[#7d8590] mb-6">{profile?.email}</p>
            
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {mockStats.map((stat, i) => (
                <div key={i} className="bg-[#1c2128] border border-[#30363d] rounded-xl p-4 flex flex-col items-center justify-center">
                  <stat.icon className={`size-5 mb-2 ${stat.color}`} />
                  <span className="text-xl font-black text-[#e6edf3]">{stat.value}</span>
                  <span className="text-[10px] text-[#7d8590] uppercase tracking-wider font-semibold mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XP Progress & Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <XPProgressBar 
              xp={mockXP} 
              level={mockLevel} 
              levelTitle="Algorithms Initiate" 
              nextLevelTitle="Code Warrior" 
              xpToNext={550} 
              xpForCurrentLevel={2000} 
            />
          </div>
          <div className="md:col-span-2">
            <div className="card-dark p-6 h-full">
              <h2 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-4 flex items-center gap-2">
                <AwardIcon className="size-4 text-[#d29922]" /> Badges
              </h2>
              <BadgeGrid 
                earnedBadges={["first_interview", "streak_3", "perfect_array", "mock_expert"]} 
                allBadges={[
                  { id: "first_interview", emoji: "🎯", label: "First Step", desc: "Complete 1 interview" },
                  { id: "streak_3", emoji: "🔥", label: "3 Day Streak", desc: "Practice 3 days in a row" },
                  { id: "perfect_array", emoji: "🧩", label: "Array Master", desc: "Perfect score in Arrays" },
                  { id: "mock_expert", emoji: "🤖", label: "AI Expert", desc: "Complete 10 AI sessions" },
                  { id: "early_bird", emoji: "🌅", label: "Early Bird", desc: "Practice before 8 AM" }
                ]} 
              />
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card-dark p-8">
          <h2 className="text-lg font-bold text-[#e6edf3] mb-6 flex items-center gap-2 border-b border-[#30363d] pb-4">
            <UserIcon className="size-5 text-[#2cbe4e]" /> Profile Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3] mb-2">
                  <BriefcaseIcon className="size-4 text-[#7d8590]" /> Current Company
                </label>
                <input
                  type="text"
                  className="input-dark w-full"
                  placeholder="e.g. Google, Startup Inc."
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3] mb-2">
                  <GithubIcon className="size-4 text-[#7d8590]" /> GitHub URL
                </label>
                <input
                  type="url"
                  className="input-dark w-full"
                  placeholder="https://github.com/username"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3] mb-2">
                  <FileTextIcon className="size-4 text-[#7d8590]" /> Resume Link
                </label>
                <input
                  type="url"
                  className="input-dark w-full"
                  placeholder="Drive/Dropbox link to PDF"
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3] mb-2">
                <CodeIcon className="size-4 text-[#7d8590]" /> Tech Stack & Skills
              </label>
              
              <div className="flex flex-wrap gap-2 mb-4 bg-[#0d1117] p-4 rounded-xl border border-[#30363d] min-h-[120px]">
                {form.techStack.length === 0 ? (
                  <p className="text-[#484f58] text-sm flex items-center justify-center w-full h-full italic">No skills added yet</p>
                ) : (
                  form.techStack.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2128] border border-[#30363d] text-[#e6edf3] text-xs font-semibold rounded-full group hover:border-[#f8514940] transition-colors">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-[#7d8590] group-hover:text-[#f85149] transition-colors focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-dark flex-1"
                  placeholder="e.g. React, Node.js, Python"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <button className="btn-outline-dark" onClick={addSkill} type="button">
                  Add 
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-10 pt-6 border-t border-[#30363d]">
            <button
              className="btn-green gap-2 px-8 shadow-lg shadow-[#2cbe4e]/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
