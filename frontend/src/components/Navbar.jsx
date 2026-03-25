import { Link, useLocation } from "react-router";
import {
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  InboxIcon,
  KanbanIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
  TrophyIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const [userRole, setUserRole] = useState("candidate");
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);
  const socketRef = useRef(null);

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

  const fetchUnread = async () => {
    try {
      const res = await axiosInstance.get("/inbox/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch {
      /* ignore */
    }
  };

  // Fetch unread count on mount + poll every 30s
  useEffect(() => {
    if (!user) return;

    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  // Socket.IO: real-time unread badge updates
  useEffect(() => {
    if (!user?.id) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(serverUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:inbox", user.id);
    });

    socket.on("inbox:unread", () => {
      fetchUnread();
    });

    socket.on("inbox:new-message", () => {
      fetchUnread();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  // Re-fetch when navigating to /inbox
  useEffect(() => {
    if (location.pathname === "/inbox" && user) {
      const fetchUnread = async () => {
        try {
          const res = await axiosInstance.get("/inbox/unread-count");
          setUnreadCount(res.data.count || 0);
        } catch {
          /* ignore */
        }
      };
      // Small delay to allow mark-as-read to process
      setTimeout(fetchUnread, 500);
    }
  }, [location.pathname, user]);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, icon, label, badge) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`px-3 py-1 flex items-center gap-2 text-sm transition-colors relative ${
          active
            ? "text-[#2cbe4e] font-medium underline decoration-[#2cbe4e] underline-offset-4"
            : "text-[#7d8590] hover:text-[#e6edf3]"
        }`}
      >
        <span className="text-current [&>svg]:size-4">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-[#f85149] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-[#0d1117] border-b border-[#30363d] sticky top-0 z-50 h-14"
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200">
          <div className="w-4 h-4 rounded-full bg-[#2cbe4e]" />
          <span className="font-bold text-white tracking-tight text-xl">Talent IQ</span>
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-1">
          {navLink("/problems", <BookOpenIcon />, "Problems")}
          {navLink("/dashboard", <LayoutDashboardIcon />, "Dashboard")}
          {navLink("/schedule", <CalendarIcon />, "Schedule")}
          {navLink("/ai-practice", <SparklesIcon />, "AI Practice")}
          {navLink("/daily-challenge", <ZapIcon />, "Daily")}
          {navLink("/company-tracks", <TrophyIcon />, "Tracks")}
          {navLink("/jobs", <BriefcaseIcon />, "Jobs")}
          {navLink("/my-applications", <LayersIcon />, "My Apps")}
          {navLink("/inbox", <InboxIcon />, "Inbox", unreadCount)}
          {navLink("/profile", <UserIcon />, "Profile")}

          {/* Recruiter/Admin-only links */}
          {(userRole === "recruiter" || userRole === "admin") &&
            navLink("/pipeline", <KanbanIcon />, "Pipeline")}

          {/* Admin-only links */}
          {userRole === "admin" &&
            navLink("/admin", <ShieldIcon />, "Admin")}

          <div className="ml-4 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
export default Navbar;
