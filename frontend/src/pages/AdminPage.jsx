// AdminPage.jsx
import { useState, useEffect, useRef } from "react";
import {
  ShieldIcon,
  UsersIcon,
  Loader2Icon,
  SearchIcon,
  FileSpreadsheetIcon,
  UploadIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error("Failed to load users — admin access required");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role) => {
    const styles = {
      admin: "border-[#f8514940] text-[#f85149] bg-[#f8514910]",
      recruiter: "border-[#58a6ff40] text-[#58a6ff] bg-[#58a6ff10]",
      interviewer: "border-[#d2992240] text-[#d29922] bg-[#d2992210]",
      candidate: "border-[#2cbe4e40] text-[#2cbe4e] bg-[#2cbe4e10]",
    };
    return styles[role] || "border-[#30363d] text-[#7d8590] bg-[#1c2128]";
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportResult(null);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await axiosInstance.post("/problems/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResult(res.data);
      toast.success(`Imported ${res.data.imported} problems!`);

      setTimeout(() => {
        setImportResult(null);
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 5000);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Import failed";
      setImportError(msg);
      toast.error(msg);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-6 py-12"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="size-12 rounded-xl bg-[#1c2128] border border-[#30363d] flex items-center justify-center shadow-lg">
            <ShieldIcon className="size-6 text-[#2cbe4e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Admin Panel</h1>
            <p className="text-[#7d8590] text-sm mt-1">Manage platform users and data</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
          <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="size-5 text-[#2cbe4e]" />
              <span className="text-[#7d8590] text-xs font-bold uppercase tracking-wider">Total Users</span>
            </div>
            <div className="text-3xl font-black text-[#e6edf3]">{users.length}</div>
          </div>
          <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 shadow-sm">
            <div className="text-[#7d8590] text-xs font-bold uppercase tracking-wider mb-2">Interviewers</div>
            <div className="text-3xl font-black text-[#d29922]">
              {users.filter((u) => u.role === "interviewer").length}
            </div>
          </div>
          <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 shadow-sm">
            <div className="text-[#7d8590] text-xs font-bold uppercase tracking-wider mb-2">Candidates</div>
            <div className="text-3xl font-black text-[#2cbe4e]">
              {users.filter((u) => u.role === "candidate").length}
            </div>
          </div>
          <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 shadow-sm">
            <div className="text-[#7d8590] text-xs font-bold uppercase tracking-wider mb-2">Recruiters</div>
            <div className="text-3xl font-black text-[#58a6ff]">
              {users.filter((u) => u.role === "recruiter").length}
            </div>
          </div>
        </div>

        {/* Import Problems from Excel */}
        <div className="card-dark p-6 mb-8 border border-[#30363d]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2cbe4e10] rounded-lg">
              <FileSpreadsheetIcon className="size-5 text-[#2cbe4e]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#e6edf3]">Import Problems</h2>
              <p className="text-sm text-[#7d8590]">
                Upload a .xlsx file to bulk import coding problems into the database
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="block w-full max-w-sm text-sm text-[#7d8590]
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-[#2cbe4e] file:text-black
                hover:file:bg-[#1a7f37] cursor-pointer"
              onChange={(e) => {
                setImportFile(e.target.files[0] || null);
                setImportResult(null);
                setImportError(null);
              }}
            />
            <button
              className={`btn-green gap-2 px-6 py-2 ${!importFile || importLoading ? 'opacity-50 cursor-not-allowed bg-[#1c2128] text-[#7d8590] hover:bg-[#1c2128]' : ''}`}
              disabled={!importFile || importLoading}
              onClick={handleImport}
            >
              {importLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <UploadIcon className="size-4" />
                  Process File
                </>
              )}
            </button>
          </div>

          {importResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-[#2cbe4e10] border border-[#2cbe4e40] p-4 rounded-xl mt-6">
              <CheckCircle2Icon className="size-5 text-[#2cbe4e]" />
              <span className="text-sm text-[#e6edf3]">
                <strong className="text-[#2cbe4e]">Success!</strong> Imported {importResult.imported} problems, skipped{" "}
                {importResult.skipped} duplicates.
              </span>
            </motion.div>
          )}

          {importError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-[#f8514910] border border-[#f8514940] p-4 rounded-xl mt-6">
              <XCircleIcon className="size-5 text-[#f85149]" />
              <span className="text-sm text-[#e6edf3]">
                <strong className="text-[#f85149]">Error:</strong> {importError}
              </span>
            </motion.div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#484f58]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="input-dark w-full pl-12 py-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1c2128] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c2128]">
                    <th className="px-6 py-4 text-xs uppercase font-bold text-[#7d8590] tracking-wider border-b border-[#30363d]">User</th>
                    <th className="px-6 py-4 text-xs uppercase font-bold text-[#7d8590] tracking-wider border-b border-[#30363d]">Email</th>
                    <th className="px-6 py-4 text-xs uppercase font-bold text-[#7d8590] tracking-wider border-b border-[#30363d]">Role</th>
                    <th className="px-6 py-4 text-xs uppercase font-bold text-[#7d8590] tracking-wider border-b border-[#30363d]">Interviews</th>
                    <th className="px-6 py-4 text-xs uppercase font-bold text-[#7d8590] tracking-wider border-b border-[#30363d]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#7d8590]">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-[#1c2128] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full border border-[#30363d] overflow-hidden bg-[#0d1117] shrink-0">
                              <img
                                src={user.profileImage || "/default-avatar.png"}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-semibold text-[#e6edf3]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#7d8590]">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#e6edf3] font-mono text-sm pl-8">
                          {user.interviewsCompleted || 0}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="input-dark py-1.5 text-sm cursor-pointer appearance-none bg-transparent max-w-[140px]"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            <option value="candidate">Candidate</option>
                            <option value="interviewer">Interviewer</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default AdminPage;
