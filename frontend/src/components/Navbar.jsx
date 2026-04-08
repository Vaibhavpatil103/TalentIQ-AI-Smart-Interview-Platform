import { Link, useLocation } from "react-router";
import { TalentIQIcon, TalentIQWordmark } from "./TalentIQLogo";
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
  MenuIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const [userRole, setUserRole] = useState("candidate");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const socket = getSocket();
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
      socket.off("connect");
      socket.off("inbox:unread");
      socket.off("inbox:new-message");
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

  const PRACTICE_LINKS = [
    { to: "/problems", icon: <BookOpenIcon />, label: "Problems" },
    { to: "/ai-practice", icon: <SparklesIcon />, label: "AI Practice" }
  ];

  const CAREER_LINKS = [
    { to: "/dashboard", icon: <LayoutDashboardIcon />, label: "Dashboard" },
    { to: "/jobs", icon: <BriefcaseIcon />, label: "Jobs" },
    { to: "/my-applications", icon: <LayersIcon />, label: "My Apps" },
    { to: "/schedule", icon: <CalendarIcon />, label: "Schedule" }
  ];

  const COMPANY_LINKS = [];
  if (userRole === "recruiter" || userRole === "admin") {
    COMPANY_LINKS.push({ to: "/pipeline", icon: <KanbanIcon />, label: "Pipeline" });
  }
  if (userRole === "admin") {
    COMPANY_LINKS.push({ to: "/admin", icon: <ShieldIcon />, label: "Admin" });
  }

  const DesktopDropdown = ({ label, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isChildActive = items.some(item => location.pathname === item.to);

    return (
      <div 
        className="relative h-full flex items-center"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button 
          className={`px-3 py-2 rounded-md flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isOpen || isChildActive 
              ? 'text-[var(--dark-accent)] bg-[var(--dark-accent-bg)]' 
              : 'text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] hover:bg-[var(--dark-elevated)]'
          }`}
        >
          {label}
          <ChevronDownIcon className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%-8px)] left-0 mt-1 w-48 bg-white border border-[var(--dark-border)] rounded-xl shadow-2xl overflow-hidden py-1 z-[100] transform origin-top-left flex flex-col"
            >
              {items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors mx-1 rounded-md ${
                      active 
                        ? "bg-[var(--dark-accent-bg)] text-[var(--dark-accent)] font-medium" 
                        : "text-[var(--dark-text)] hover:bg-[var(--dark-elevated)] hover:text-[var(--dark-text)]"
                    }`}
                  >
                    <span className={`[&>svg]:size-4 ${active ? "opacity-100" : "opacity-70"}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const navLink = (to, icon, label, badge) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors relative ${
          active
            ? "text-[var(--dark-accent)] bg-[var(--dark-accent-bg)]"
            : "text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] hover:bg-[var(--dark-elevated)]"
        }`}
      >
        <span className="text-current [&>svg]:size-4">{icon}</span>
        <span>{label}</span>
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--color-danger)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border border-[var(--dark-bg)]">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  const mobileNavLink = (to, icon, label, badge) => {
    const active = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`px-3 py-2.5 rounded-lg flex items-center justify-between text-sm font-medium transition-colors ${
          active
            ? "text-[var(--dark-accent)] bg-[var(--dark-accent-bg)]"
            : "text-[var(--dark-text)] hover:bg-[var(--dark-card)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`[&>svg]:size-5 ${active ? "text-[var(--dark-accent)]" : "text-[var(--dark-text-secondary)]"}`}>{icon}</span>
          <span>{label}</span>
        </div>
        {badge > 0 && (
          <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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
      className="bg-white border-b border-[var(--dark-border)] sticky top-0 z-50 h-14 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200">
          <TalentIQIcon size={28} />
          <TalentIQWordmark variant="light" />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden lg:flex items-center gap-2 h-full">
          <DesktopDropdown label="Practice" items={PRACTICE_LINKS} />
          <DesktopDropdown label="Career" items={CAREER_LINKS} />
          {COMPANY_LINKS.length > 0 && <DesktopDropdown label="Company" items={COMPANY_LINKS} />}

          <div className="w-px h-6 bg-[var(--dark-border)] mx-1"></div>

          {navLink("/inbox", <InboxIcon />, "Inbox", unreadCount)}
          {navLink("/profile", <UserIcon />, "Profile")}

          <div className="ml-2 flex items-center">
            <UserButton />
          </div>
        </div>

        {/* MOBILE TOGGLE & BUTTON */}
        <div className="flex lg:hidden items-center gap-4">
          <UserButton />
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] transition-colors"
          >
            <div className="relative">
              <MenuIcon className="size-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-2.5 bg-[var(--color-danger)] rounded-full border border-white" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white border-l border-[var(--dark-border)] z-50 lg:hidden overflow-y-auto flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-[var(--dark-border)] flex items-center justify-between sticky top-0 bg-white z-10">
                <span className="font-bold text-[var(--dark-text)] flex items-center gap-2">
                  <TalentIQIcon size={20} />
                  Menu
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1.5 rounded-md text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] hover:bg-[var(--dark-elevated)] transition-colors"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 py-4 px-3 flex flex-col gap-6">
                
                {/* Practice Section */}
                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--dark-text-tertiary)] mb-2">Practice</div>
                  {PRACTICE_LINKS.map(item => mobileNavLink(item.to, item.icon, item.label))}
                </div>

                {/* Career Section */}
                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--dark-text-tertiary)] mb-2">Career</div>
                  {CAREER_LINKS.map(item => mobileNavLink(item.to, item.icon, item.label))}
                </div>

                {/* Company Section */}
                {COMPANY_LINKS.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--dark-text-tertiary)] mb-2">Company</div>
                    {COMPANY_LINKS.map(item => mobileNavLink(item.to, item.icon, item.label))}
                  </div>
                )}

                <div className="h-px bg-[var(--dark-border)] mx-3" />

                <div className="space-y-1 pb-6">
                  {mobileNavLink("/inbox", <InboxIcon />, "Inbox", unreadCount)}
                  {mobileNavLink("/profile", <UserIcon />, "Profile")}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
export default Navbar;
