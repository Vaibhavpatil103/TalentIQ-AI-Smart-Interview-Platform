import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { UserButton, useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  BuildingIcon,
  KanbanIcon,
  SparklesIcon,
  InboxIcon,
  BellIcon,
  SendIcon,
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  CommandIcon,
  MenuIcon,
  XIcon,
  SettingsIcon,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";

// ─── Navigation config ────────────────────────────────────────
// Primary links always visible in the navbar
const PRIMARY_LINKS = [
  { to: "/company/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
  { to: "/company/jobs", icon: BriefcaseIcon, label: "Jobs" },
  { to: "/company/candidates", icon: UsersIcon, label: "Candidates" },
  { to: "/company/interviews", icon: CalendarIcon, label: "Interviews" },
];

// Secondary links collapsed into "More" dropdown
const SECONDARY_LINKS = [
  { to: "/company/ai-matching", icon: SparklesIcon, label: "AI Match" },
  { to: "/company/offers", icon: SendIcon, label: "Offers" },
  { to: "/company/pipeline", icon: KanbanIcon, label: "Pipeline" },
  { to: "/company/inbox", icon: InboxIcon, label: "Inbox", showBadge: true },
  { to: "/company/profile", icon: BuildingIcon, label: "Company" },
];

// Quick-create actions
const CREATE_ACTIONS = [
  { label: "Post a Job", to: "/company/jobs", icon: BriefcaseIcon },
  { label: "Schedule Interview", to: "/company/interviews", icon: CalendarIcon },
];

// Command palette items
const COMMAND_ITEMS = [
  { label: "Create Job", to: "/company/jobs", icon: BriefcaseIcon },
  { label: "Search Candidates", to: "/company/candidates", icon: UsersIcon },
  { label: "Schedule Interview", to: "/company/interviews", icon: CalendarIcon },
  { label: "AI Matching", to: "/company/ai-matching", icon: SparklesIcon },
  { label: "View Pipeline", to: "/company/pipeline", icon: KanbanIcon },
  { label: "Check Inbox", to: "/company/inbox", icon: InboxIcon },
  { label: "Company Settings", to: "/company/profile", icon: SettingsIcon },
];

// ─── Dropdown animation variants ─────────────────────────────
const dropdownVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: 4, scale: 0.98,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

// ─── Custom hook: click outside ──────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// ═══════════════════════════════════════════════════════════════
// NavItem — individual navigation link with icon + active pill
// ═══════════════════════════════════════════════════════════════
const NavItem = ({ to, icon: Icon, label, active, badge }) => (
  <Link to={to} className="relative">
    <motion.div
      className="relative flex items-center gap-[6px] px-3 py-[7px] rounded-lg text-[13px] font-medium select-none cursor-pointer"
      style={{
        color: active ? "#51555aff" : "#57606a",
        backgroundColor: active ? "rgba(9, 105, 218, 0.08)" : "transparent",
      }}
      whileHover={{
        backgroundColor: active ? "rgba(9, 105, 218, 0.12)" : "rgba(0, 0, 0, 0.04)",
        color: active ? "#63686eff" : "#1c2128",
        scale: 1.02,
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
    >
      <Icon style={{ width: 15, height: 15, opacity: active ? 1 : 0.65, flexShrink: 0 }} />
      <span className="hidden md:inline whitespace-nowrap">{label}</span>

      {/* Animated active pill underline */}
      {active && (
        <motion.span
          className="absolute left-2 right-2 h-[2px] rounded-full"
          style={{
            bottom: -9,
            background: "linear-gradient(90deg, #0969da, #54aeff)",
          }}
          layoutId="activeNavIndicator"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Unread badge */}
      {badge != null && badge > 0 && (
        <motion.span
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] rounded-full text-white text-[10px] font-bold px-[5px]"
          style={{
            background: "linear-gradient(135deg, #f85149, #cf222e)",
            boxShadow: "0 1px 4px rgba(207,34,46,0.4)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {badge > 99 ? "99+" : badge}
        </motion.span>
      )}
    </motion.div>
  </Link>
);

// ═══════════════════════════════════════════════════════════════
// MoreDropdown — collapsible secondary nav links
// ═══════════════════════════════════════════════════════════════
function MoreDropdown({ links, isActive, unreadCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  // highlight "More" if any secondary link is active
  const anySecondaryActive = links.some((l) => isActive(l.to));

  return (
    <div className="relative" ref={ref}>
      <motion.button
        className="flex items-center gap-[5px] px-3 py-[7px] rounded-lg text-[13px] font-medium select-none cursor-pointer"
        style={{
          color: anySecondaryActive ? "#0969da" : "#57606a",
          backgroundColor: open
            ? "rgba(0,0,0,0.06)"
            : anySecondaryActive
              ? "rgba(9,105,218,0.08)"
              : "transparent",
        }}
        whileHover={{
          backgroundColor: "rgba(0,0,0,0.05)",
          color: "#1c2128",
          scale: 1.02,
        }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((p) => !p)}
        transition={{ duration: 0.12 }}
      >
        <span className="hidden md:inline">More</span>
        <ChevronDownIcon
          className="transition-transform duration-200"
          style={{
            width: 14,
            height: 14,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-[calc(100%+8px)] left-0 w-52 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            }}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="py-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors duration-100 relative"
                    style={{
                      color: active ? "#0969da" : "#3d444d",
                      backgroundColor: active ? "rgba(9,105,218,0.06)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                        style={{ background: "#0969da" }}
                      />
                    )}
                    <Icon style={{ width: 15, height: 15, opacity: active ? 1 : 0.6 }} />
                    <span>{link.label}</span>
                    {link.showBadge && unreadCount > 0 && (
                      <span
                        className="ml-auto text-[10px] font-bold px-[6px] py-[1px] rounded-full text-white"
                        style={{ background: "linear-gradient(135deg, #f85149, #cf222e)" }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CreateDropdown — "+ Create" primary CTA with dropdown menu
// ═══════════════════════════════════════════════════════════════
function CreateDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <motion.button
        className="flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-semibold select-none cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #0969da, #0550ae)",
          color: "#fff",
          boxShadow: "0 1px 4px rgba(9,105,218,0.3)",
        }}
        whileHover={{ scale: 1.04, boxShadow: "0 2px 10px rgba(9,105,218,0.35)" }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.12 }}
        onClick={() => setOpen((p) => !p)}
      >
        <PlusIcon style={{ width: 15, height: 15 }} />
        <span className="hidden sm:inline">Create</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-[calc(100%+8px)] right-0 w-52 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            }}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="py-1.5">
              {CREATE_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-[#3d444d] transition-colors duration-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(9,105,218,0.06)";
                      e.currentTarget.style.color = "#0969da";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#3d444d";
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(9,105,218,0.08)" }}
                    >
                      <Icon style={{ width: 14, height: 14, color: "#0969da" }} />
                    </div>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NotificationBell — icon with animated unread badge
// ═══════════════════════════════════════════════════════════════
function NotificationBell({ count }) {
  return (
    <motion.button
      className="relative p-2 rounded-lg"
      style={{ color: "#57606a" }}
      whileHover={{
        scale: 1.06,
        backgroundColor: "rgba(0,0,0,0.04)",
        color: "#1c2128",
      }}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.12 }}
      aria-label="Notifications"
    >
      <BellIcon style={{ width: 17, height: 17 }} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="bell-badge"
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold px-1"
            style={{
              background: "linear-gradient(135deg, #f85149, #cf222e)",
              boxShadow: "0 1px 3px rgba(207,34,46,0.4), 0 0 0 2px #fff",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// ProfileDropdown — avatar + name + dropdown
// ═══════════════════════════════════════════════════════════════
function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const initials = useMemo(() => {
    const f = user?.firstName?.[0] || "";
    const l = user?.lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  }, [user?.firstName, user?.lastName]);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg select-none cursor-pointer"
        style={{ color: "#3d444d" }}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.04)" }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((p) => !p)}
        transition={{ duration: 0.12 }}
      >
        {/* Avatar */}
        <div
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0969da, #0550ae)",
            boxShadow: "0 1px 3px rgba(9,105,218,0.3)",
          }}
        >
          {initials}
        </div>
        <span className="hidden lg:inline text-[13px] font-medium text-[#1c2128] max-w-[100px] truncate">
          {user?.firstName}
        </span>
        <ChevronDownIcon
          className="transition-transform duration-200 hidden lg:block"
          style={{
            width: 13,
            height: 13,
            color: "#7d8590",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-[calc(100%+8px)] right-0 w-56 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            }}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* User info header */}
            <div className="px-3.5 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <p className="text-[13px] font-semibold text-[#1c2128]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-[#7d8590] mt-0.5 truncate">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
            <div className="py-1.5">
              {[
                { label: "Profile", to: "/company/profile", icon: BuildingIcon },
                { label: "Company Settings", to: "/company/profile", icon: SettingsIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-[#3d444d] transition-colors duration-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon style={{ width: 15, height: 15, opacity: 0.6 }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {/* Clerk UserButton for sign-out is still available via the avatar */}
            <div className="border-t px-3.5 py-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-6 h-6 rounded-full",
                      userButtonTrigger: "focus:shadow-none",
                    },
                    variables: { colorPrimary: "#0969da" },
                  }}
                />
                <span className="text-[12px] text-[#7d8590]">Manage account</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CommandPalette — ⌘K / Ctrl+K global search modal
// ═══════════════════════════════════════════════════════════════
function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(
    () =>
      query.length === 0
        ? COMMAND_ITEMS
        : COMMAND_ITEMS.filter((c) =>
          c.label.toLowerCase().includes(query.toLowerCase())
        ),
    [query]
  );

  const handleSelect = useCallback(
    (to) => {
      navigate(to);
      onClose();
    },
    [navigate, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[520px] mx-4 rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 4px 14px rgba(0,0,0,0.08)",
            }}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <SearchIcon style={{ width: 17, height: 17, color: "#7d8590", flexShrink: 0 }} />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-[14px] text-[#1c2128] placeholder-[#9ba4af] outline-none"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].to);
                }}
              />
              <kbd
                className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                style={{ color: "#7d8590", borderColor: "#d0d7de", backgroundColor: "#f6f8fa" }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-2 max-h-[280px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-[13px] text-[#7d8590] py-6">No results found</p>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[13px] font-medium text-[#3d444d] transition-colors duration-100"
                      onClick={() => handleSelect(item.to)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(9,105,218,0.06)";
                        e.currentTarget.style.color = "#0969da";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#3d444d";
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(9,105,218,0.06)" }}
                      >
                        <Icon style={{ width: 14, height: 14, color: "#0969da" }} />
                      </div>
                      {item.label}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center gap-4 px-4 py-2 border-t text-[11px] text-[#9ba4af]"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <span className="flex items-center gap-1">
                <kbd className="font-medium px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: "#d0d7de", backgroundColor: "#f6f8fa" }}>↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-medium px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: "#d0d7de", backgroundColor: "#f6f8fa" }}>↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-medium px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: "#d0d7de", backgroundColor: "#f6f8fa" }}>Esc</kbd>
                Close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// MobileMenu — hamburger slide-out for small screens
// ═══════════════════════════════════════════════════════════════
function MobileMenu({ isOpen, onClose, links, isActive, unreadCount }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-[280px] z-[95] border-r overflow-y-auto"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.06)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #0969da, #0550ae)" }}
                >
                  <SparklesIcon className="size-4 text-white" />
                </div>
                <span className="font-extrabold text-[15px] text-[#0d1117]">TalentIQ</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.04)] text-[#7d8590]">
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Links */}
            <div className="py-3 px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4af] px-2 mb-2">Navigation</p>
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[14px] font-medium mb-0.5 transition-colors duration-100"
                    style={{
                      color: active ? "#0969da" : "#3d444d",
                      backgroundColor: active ? "rgba(9,105,218,0.08)" : "transparent",
                    }}
                  >
                    <Icon style={{ width: 17, height: 17, opacity: active ? 1 : 0.6 }} />
                    {link.label}
                    {link.showBadge && unreadCount > 0 && (
                      <span
                        className="ml-auto text-[10px] font-bold px-[6px] py-[1px] rounded-full text-white"
                        style={{ background: "linear-gradient(135deg, #f85149, #cf222e)" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="py-3 px-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4af] px-2 mb-2">Quick Actions</p>
              {CREATE_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[14px] font-medium text-[#3d444d] mb-0.5 hover:bg-[rgba(0,0,0,0.03)]"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(9,105,218,0.08)" }}>
                      <Icon style={{ width: 14, height: 14, color: "#0969da" }} />
                    </div>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// CompanyNavbar — main component
// ═══════════════════════════════════════════════════════════════
function CompanyNavbar() {
  const location = useLocation();
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Unread inbox count, refreshed every 60 s ───────────────
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axiosInstance.get("/inbox/unread-count");
        setUnreadCount(res.data.count || 0);
      } catch {
        /* silent fail */
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Command Palette keyboard shortcut ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Active if exact match or sub-path (but NOT cross-path)
  const isActive = useCallback(
    (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/")),
    [location.pathname]
  );

  const allLinks = useMemo(() => [...PRIMARY_LINKS, ...SECONDARY_LINKS], []);

  return (
    <>
      <motion.nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: "rgba(0, 0, 0, 0.06)",
        }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-5 h-[56px] flex items-center justify-between gap-3">

          {/* ══ LEFT — Hamburger (mobile) + Logo ═════════════════ */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile hamburger */}
            <motion.button
              className="lg:hidden p-1.5 rounded-lg text-[#57606a]"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.04)" }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon style={{ width: 20, height: 20 }} />
            </motion.button>

            {/* Logo */}
            <Link
              to="/company/dashboard"
              className="group flex items-center gap-2 transition-all duration-200"
            >
              <motion.div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0969da 0%, #0550ae 50%, #033d8b 100%)",
                  boxShadow: "0 2px 8px rgba(9,105,218,0.25)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }}
                />
                <SparklesIcon className="size-[15px] text-white relative z-10" />
              </motion.div>

              <span className="font-extrabold text-[15px] tracking-[-0.02em] text-[#0d1117] group-hover:text-[#0969da] transition-colors duration-200 hidden sm:inline">
                TalentIQ
              </span>
            </Link>

            {/* Divider */}
            <div className="w-px h-6 mx-3 flex-shrink-0 bg-gradient-to-b from-transparent via-[#d0d7de] to-transparent hidden lg:block" />
          </div>

          {/* ══ CENTER — Primary nav + More dropdown ═════════════ */}
          <div className="hidden lg:flex items-center gap-[2px] flex-1 justify-start">
            {PRIMARY_LINKS.map((link) => (
              <NavItem
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                active={isActive(link.to)}
              />
            ))}
            <MoreDropdown links={SECONDARY_LINKS} isActive={isActive} unreadCount={unreadCount} />

            {/* ⌘K shortcut hint */}
            <motion.button
              className="ml-3 flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[12px] text-[#9ba4af] cursor-pointer"
              style={{ borderColor: "#d8dee4", backgroundColor: "rgba(0,0,0,0.015)" }}
              whileHover={{
                borderColor: "#0969da",
                color: "#0969da",
                backgroundColor: "rgba(9,105,218,0.04)",
                scale: 1.02,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
              onClick={() => setCmdOpen(true)}
            >
              <SearchIcon style={{ width: 13, height: 13 }} />
              <span className="hidden xl:inline">Search</span>
              <kbd
                className="text-[10px] font-medium px-1 py-0 rounded ml-1"
                style={{ backgroundColor: "#f6f8fa", border: "1px solid #d0d7de" }}
              >
                ⌘K
              </kbd>
            </motion.button>
          </div>

          {/* ══ RIGHT — Actions + Bell + Profile ════════════════ */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CreateDropdown />

            <div className="w-px h-5 bg-gradient-to-b from-transparent via-[#d0d7de] to-transparent mx-1 hidden sm:block" />

            <NotificationBell count={unreadCount} />
            <ProfileDropdown user={user} />
          </div>

        </div>
      </motion.nav>

      {/* ── Command Palette (rendered outside nav) ────────────── */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* ── Mobile menu (rendered outside nav) ────────────────── */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={allLinks}
        isActive={isActive}
        unreadCount={unreadCount}
      />
    </>
  );
}

export default CompanyNavbar;
