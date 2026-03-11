import { useState, useEffect } from "react";
import {
  ShieldIcon,
  UsersIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const getRoleBadge = (role) => {
    const styles = {
      admin: "badge-error",
      recruiter: "badge-info",
      interviewer: "badge-warning",
      candidate: "badge-success",
    };
    return styles[role] || "badge-ghost";
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShieldIcon className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-base-content/60">Manage users and roles</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats shadow mb-8 w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <UsersIcon className="size-8" />
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{users.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Interviewers</div>
            <div className="stat-value text-warning">
              {users.filter((u) => u.role === "interviewer").length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Candidates</div>
            <div className="stat-value text-success">
              {users.filter((u) => u.role === "candidate").length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Recruiters</div>
            <div className="stat-value text-info">
              {users.filter((u) => u.role === "recruiter").length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="size-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra bg-base-100 rounded-xl shadow-lg">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Interviews</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 rounded-full">
                            <img
                              src={user.profileImage || "/default-avatar.png"}
                              alt={user.name}
                            />
                          </div>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="text-base-content/60">{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)} capitalize`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.interviewsCompleted || 0}</td>
                    <td>
                      <select
                        className="select select-bordered select-sm"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
