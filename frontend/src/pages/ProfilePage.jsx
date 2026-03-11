import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  UserIcon,
  BriefcaseIcon,
  GithubIcon,
  FileTextIcon,
  SaveIcon,
  Loader2Icon,
  CodeIcon,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

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
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body items-center text-center">
            <div className="avatar mb-4">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user?.imageUrl} alt={profile?.name} />
              </div>
            </div>
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-base-content/60">{profile?.email}</p>
            <div className="badge badge-primary badge-lg mt-2 capitalize">
              {profile?.role || "candidate"}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Edit Profile</h2>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <BriefcaseIcon className="size-4" /> Company
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Your company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <GithubIcon className="size-4" /> GitHub URL
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder="https://github.com/username"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FileTextIcon className="size-4" /> Resume URL
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder="https://drive.google.com/..."
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <CodeIcon className="size-4" /> Tech Stack
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {form.techStack.map((skill) => (
                    <span key={skill} className="badge badge-primary gap-1">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-primary-content hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button className="btn btn-primary" onClick={addSkill}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary gap-2"
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
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
