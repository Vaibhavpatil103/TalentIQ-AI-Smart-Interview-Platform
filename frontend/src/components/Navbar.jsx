import { Link, useLocation } from "react-router";
import {
  BookOpenIcon,
  CalendarIcon,
  InboxIcon,
  KanbanIcon,
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

  const navLink = (to, icon, label, badge) => (
    <Link
      to={to}
      className={`px-4 py-2.5 rounded-lg transition-all duration-200 
        ${
          isActive(to)
            ? "bg-primary text-primary-content"
            : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
        }`}
    >
      <div className="flex items-center gap-x-2.5 relative">
        {icon}
        <span className="font-medium hidden sm:inline">{label}</span>
        {badge > 0 && (
          <span className="badge badge-error badge-xs absolute -top-2 -right-3 text-[10px] font-bold px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
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
          {navLink("/ai-practice", <SparklesIcon className="size-4" />, "AI Practice")}
          {navLink("/daily-challenge", <ZapIcon className="size-4" />, "Daily")}
          {navLink("/company-tracks", <TrophyIcon className="size-4" />, "Tracks")}
          {navLink("/inbox", <InboxIcon className="size-4" />, "Inbox", unreadCount)}
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
