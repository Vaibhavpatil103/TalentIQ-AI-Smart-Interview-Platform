import { Link, useLocation } from "react-router";
import {
  BookOpenIcon,
  CalendarIcon,
  KanbanIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const [userRole, setUserRole] = useState("candidate");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        setUserRole(res.data.user?.role || "candidate");
      } catch {
        // silently fail — user may not be authenticated yet
      }
    };
    if (user) fetchRole();
  }, [user]);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, icon, label) => (
    <Link
      to={to}
      className={`px-4 py-2.5 rounded-lg transition-all duration-200 
        ${
          isActive(to)
            ? "bg-primary text-primary-content"
            : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
        }`}
    >
      <div className="flex items-center gap-x-2.5">
        {icon}
        <span className="font-medium hidden sm:inline">{label}</span>
      </div>
    </Link>
  );

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navLink("/problems", <BookOpenIcon className="size-4" />, "Problems")}
          {navLink("/dashboard", <LayoutDashboardIcon className="size-4" />, "Dashboard")}
          {navLink("/schedule", <CalendarIcon className="size-4" />, "Schedule")}
          {navLink("/profile", <UserIcon className="size-4" />, "Profile")}

          {/* Recruiter/Admin-only links */}
          {(userRole === "recruiter" || userRole === "admin") &&
            navLink("/pipeline", <KanbanIcon className="size-4" />, "Pipeline")}

          {/* Admin-only links */}
          {userRole === "admin" &&
            navLink("/admin", <ShieldIcon className="size-4" />, "Admin")}

          <div className="ml-4 mt-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
