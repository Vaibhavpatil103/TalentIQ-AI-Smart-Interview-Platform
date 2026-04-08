import { useState, useEffect, useCallback, useRef } from "react";
import {
  InboxIcon,
  Loader2Icon,
  SendIcon,
  XIcon,
  PlusIcon,
  PencilIcon,
  ArchiveIcon,
  MessageSquareIcon,
} from "lucide-react";
import CompanyNavbar from "../../components/CompanyNavbar";
import { axiosInstance } from "../../lib/axios";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { getSocket } from "../../lib/socket";
import { motion, AnimatePresence } from "framer-motion";

// ── Type config — white+blue palette ───────────────────────────
const TYPE_CONFIG = {
  feedback:     { label: "Feedback",     color: "bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]" },
  offer_letter: { label: "Offer Letter", color: "bg-[#dcfce7] text-[#16a34a] border-[#86efac]" },
  appointment:  { label: "Appointment",  color: "bg-[#fef9c3] text-[#ca8a04] border-[#facc15]" },
  rejection:    { label: "Rejection",    color: "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]" },
  general:      { label: "General",      color: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]" },
};

const FILTER_TABS = [
  { key: "all",          label: "All Messages" },
  { key: "feedback",     label: "Feedback" },
  { key: "offer_letter", label: "Offer Letters" },
  { key: "rejection",    label: "Rejections" },
  { key: "general",      label: "General" },
];

const inputCls = "input-light w-full transition-all duration-200";

function CompanyInboxPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientEmail: "",
    type: "general",
    subject: "",
    body: "",
  });
  const [sendingCompose, setSendingCompose] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socketRef = useRef(null);
  const selectedMessageRef = useRef(null);

  useEffect(() => {
    selectedMessageRef.current = selectedMessage;
  }, [selectedMessage]);

  useEffect(() => {
    fetchMessages();
  }, [filter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket.IO real-time ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join:inbox", user.id));

    socket.on("inbox:new-message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [{ ...msg, replyCount: 0, lastActivity: msg.createdAt }, ...prev];
      });
      if (!msg.isSentByMe) toast("📬 New message received!");
    });

    socket.on("inbox:new-reply", (reply) => {
      const current = selectedMessageRef.current;
      if (current && reply.parentMessageId === current._id) {
        setReplies((prev) => {
          if (prev.some((r) => r._id === reply._id)) return prev;
          return [...prev, reply];
        });
      }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === reply.parentMessageId
            ? { ...m, replyCount: (m.replyCount || 0) + 1, lastActivity: reply.createdAt }
            : m
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("inbox:new-message");
      socket.off("inbox:new-reply");
      socketRef.current = null;
    };
  }, [user?.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/inbox?page=${page}&limit=20&type=${filter}`);
      setMessages(res.data.messages || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSelectMessage = async (msg) => {
    try {
      const res = await axiosInstance.get(`/inbox/${msg._id}`);
      setSelectedMessage(res.data.message);
      setReplies(res.data.replies || []);
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
      );
    } catch { toast.error("Failed to load message"); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    setSendingReply(true);
    try {
      const res = await axiosInstance.post(`/inbox/${selectedMessage._id}/reply`, {
        body: replyText.trim(),
      });
      setReplies((prev) => [...prev, res.data.reply]);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === selectedMessage._id
            ? { ...m, replyCount: (m.replyCount || 0) + 1 }
            : m
        )
      );
      setReplyText("");
      toast.success("Reply sent!");
    } catch { toast.error("Failed to send reply"); }
    finally { setSendingReply(false); }
  };

  const handleCompose = async () => {
    if (!composeData.recipientEmail || !composeData.subject || !composeData.body) {
      toast.error("Please fill all fields");
      return;
    }
    setSendingCompose(true);
    try {
      await axiosInstance.post("/inbox", composeData);
      toast.success("Message sent!");
      setShowCompose(false);
      setComposeData({ recipientEmail: "", type: "general", subject: "", body: "" });
      fetchMessages();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send"); }
    finally { setSendingCompose(false); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const diff = Date.now() - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
      <CompanyNavbar />

      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════ */}
        <div className={`w-72 bg-white border-r border-[#e2e8f0] flex flex-col flex-shrink-0
          ${selectedMessage ? "hidden lg:flex" : "flex"}`}>

          {/* Compose button */}
          <div className="p-4 border-b border-[#e2e8f0]">
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-[#004182]
                text-white w-full rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              <PencilIcon className="size-4" />
              Compose
            </button>
          </div>

          {/* Filter tabs */}
          <div className="px-2 py-3 border-b border-[#e2e8f0] flex flex-col gap-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setPage(1); setSelectedMessage(null); }}
                aria-label={`Filter by ${tab.label}`}
                aria-pressed={filter === tab.key}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
                  cursor-pointer transition-colors text-left ${
                  filter === tab.key
                    ? "bg-[#e8f0fe] text-[#0a66c2] font-medium"
                    : "text-[#64748b] hover:bg-[#f8fafc]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 skeleton-light" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 h-full text-center">
                <ArchiveIcon className="size-8 text-[#e2e8f0] mb-3" />
                <p className="font-medium text-[#0f172a] text-sm">No messages</p>
                <p className="text-xs text-[#94a3b8] mt-1">Your inbox is empty</p>
              </div>
            ) : (
              <div>
                {messages.map((msg) => {
                  const isSelected = selectedMessage?._id === msg._id;
                  const isUnread = !msg.isRead;
                  const typeCfg = TYPE_CONFIG[msg.type] || TYPE_CONFIG.general;
                  return (
                    <button
                      key={msg._id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full text-left px-4 py-3 border-b border-[#f6f8fa]
                        cursor-pointer transition-colors block ${
                        isSelected
                          ? "bg-[#e8f0fe] border-l-2 border-l-[#0a66c2]"
                          : isUnread
                          ? "bg-[#fafbfc] border-l-2 border-l-[#0a66c2] font-semibold hover:bg-[#f8fafc]"
                          : "hover:bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#0a66c2] text-white text-xs
                          flex items-center justify-center font-bold uppercase flex-shrink-0">
                          {(msg.senderName || "?")[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm truncate ${isUnread ? "font-semibold text-[#0f172a]" : "text-[#64748b]"}`}>
                              {msg.isSentByMe ? "Me" : msg.senderName}
                            </span>
                            <span className="text-[10px] text-[#94a3b8] flex-shrink-0 ml-2">
                              {formatDate(msg.lastActivity || msg.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm truncate mt-0.5 ${isUnread ? "font-medium text-[#0f172a]" : "text-[#64748b]"}`}>
                            {msg.subject}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${typeCfg.color}`}>
                              {typeCfg.label}
                            </span>
                            {msg.replyCount > 0 && (
                              <span className="text-[10px] text-[#94a3b8] flex items-center gap-0.5 ml-auto">
                                <MessageSquareIcon className="size-3" />
                                {msg.replyCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-[#e2e8f0] flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs text-[#64748b] hover:text-[#0f172a] disabled:opacity-40 px-2 py-1"
              >
                Prev
              </button>
              <span className="text-xs text-[#94a3b8]">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs text-[#64748b] hover:text-[#0f172a] disabled:opacity-40 px-2 py-1"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ══ RIGHT PANEL ════════════════════════════════════════ */}
        <div className={`flex-1 flex flex-col overflow-hidden
          ${!selectedMessage ? "hidden lg:flex" : "flex"}`}>
          {selectedMessage ? (
            <div className="flex flex-col h-full bg-white">
              {/* Message header */}
              <div className="px-8 py-6 border-b border-[#e2e8f0] flex-shrink-0">
                <h2 className="text-xl font-bold text-[#0f172a]">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-7 h-7 rounded-full bg-[#0a66c2] text-white text-xs
                    flex items-center justify-center font-bold flex-shrink-0">
                    {(selectedMessage.senderName || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-[#64748b]">{selectedMessage.senderName}</span>
                  <span className="text-sm text-[#94a3b8]">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ml-auto flex-shrink-0
                    ${(TYPE_CONFIG[selectedMessage.type] || TYPE_CONFIG.general).color}`}>
                    {(TYPE_CONFIG[selectedMessage.type] || TYPE_CONFIG.general).label}
                  </span>
                </div>
              </div>

              {/* Body + replies */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <p className="text-[#0f172a] leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedMessage.body}
                </p>

                {replies.length > 0 && (
                  <div className="pt-6 border-t border-[#e2e8f0] space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                      Thread ({replies.length})
                    </h3>
                    {replies.map((reply) => {
                      const isMine = reply.senderId === user?.id;
                      return (
                        <div key={reply._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm
                            border ${isMine
                              ? "bg-[#e8f0fe] border-[#8bb9fe] text-[#0f172a] rounded-tr-sm"
                              : "bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] rounded-tl-sm"
                            }`}>
                            <div className="flex items-center justify-between gap-4 mb-1.5 pb-1.5
                              border-b border-[#e2e8f0]/40">
                              <span className="text-xs font-semibold text-[#64748b]">
                                {isMine ? "You" : reply.senderName}
                              </span>
                              <span className="text-[10px] text-[#94a3b8]">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{reply.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reply section */}
              <div className="px-8 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-3">Reply</p>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182]
                      disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm
                      font-semibold transition-colors"
                  >
                    {sendingReply
                      ? <Loader2Icon className="size-4 animate-spin" />
                      : <SendIcon className="size-4" />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <InboxIcon className="size-12 text-[#e2e8f0] mb-4" />
              <p className="text-[#94a3b8] text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ COMPOSE MODAL ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCompose(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg mx-4
                shadow-xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
                <h3 className="font-bold text-[#0f172a]">Compose Message</h3>
                <button onClick={() => setShowCompose(false)} className="text-[#64748b] hover:text-[#0f172a]">
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {[
                  { label: "Recipient Email", key: "recipientEmail", type: "email", placeholder: "candidate@example.com" },
                  { label: "Subject", key: "subject", type: "text", placeholder: "Message subject" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      className={inputCls}
                      placeholder={placeholder}
                      value={composeData[key]}
                      onChange={(e) => setComposeData({ ...composeData, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    className={inputCls}
                    value={composeData.type}
                    onChange={(e) => setComposeData({ ...composeData, type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="appointment">Appointment</option>
                    <option value="rejection">Rejection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">Body</label>
                  <textarea
                    className={`${inputCls} min-h-[140px] resize-y`}
                    placeholder="Write your message..."
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b]
                    hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompose}
                  disabled={sendingCompose}
                  className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182]
                    disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-semibold"
                >
                  {sendingCompose
                    ? <Loader2Icon className="size-4 animate-spin" />
                    : <SendIcon className="size-4" />}
                  Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompanyInboxPage;
